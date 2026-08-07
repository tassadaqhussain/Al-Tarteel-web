import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { parseDurationMs } from './auth-cookies';
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

const BCRYPT_ROUNDS = 12;

export type AuthUserView = {
  id: number;
  email: string | null;
  name: string | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  get accessExpiresIn(): string {
    return process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
  }

  get refreshExpiresIn(): string {
    return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  get accessMaxAgeMs(): number {
    return parseDurationMs(this.accessExpiresIn, 15 * 60_000);
  }

  get refreshMaxAgeMs(): number {
    return parseDurationMs(this.refreshExpiresIn, 7 * 86_400_000);
  }

  private sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /** Legacy hash used before bcrypt — upgrade on successful login. */
  private legacyHash(password: string): string {
    return crypto
      .createHash('sha256')
      .update(password + (process.env.JWT_SECRET || 'salt'))
      .digest('hex');
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private async verifyPassword(password: string, stored: string): Promise<'bcrypt' | 'legacy' | null> {
    if (stored.startsWith('$2a$') || stored.startsWith('$2b$') || stored.startsWith('$2y$')) {
      const ok = await bcrypt.compare(password, stored);
      return ok ? 'bcrypt' : null;
    }
    if (stored === this.legacyHash(password)) return 'legacy';
    return null;
  }

  private assertPasswordMatch(password: string, confirm: string) {
    if (password !== confirm) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  private toView(user: { id: number; email: string | null; name: string | null }): AuthUserView {
    return { id: user.id, email: user.email, name: user.name };
  }

  private signAccessToken(user: { id: number; email: string | null }) {
    return this.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: this.accessExpiresIn as `${number}${'s' | 'm' | 'h' | 'd'}` },
    );
  }

  private async issueRefreshToken(
    userId: number,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<string> {
    const raw = crypto.randomBytes(48).toString('base64url');
    const tokenHash = this.sha256(raw);
    const expiresAt = new Date(Date.now() + this.refreshMaxAgeMs);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent: meta?.userAgent?.slice(0, 500),
        ip: meta?.ip?.slice(0, 64),
      },
    });
    return raw;
  }

  async issueSession(
    user: { id: number; email: string | null; name: string | null },
    meta?: { userAgent?: string; ip?: string },
  ) {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user.id, meta);
    return {
      user: this.toView(user),
      accessToken,
      refreshToken,
      accessMaxAgeMs: this.accessMaxAgeMs,
      refreshMaxAgeMs: this.refreshMaxAgeMs,
    };
  }

  async register(dto: RegisterDto, meta?: { userAgent?: string; ip?: string }) {
    this.assertPasswordMatch(dto.password, dto.confirmPassword);
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing?.passwordHash) {
      throw new ConflictException('Unable to create account with that email');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user =
      existing && !existing.passwordHash
        ? await this.prisma.user.update({
            where: { id: existing.id },
            data: { name: dto.name.trim(), passwordHash },
          })
        : await this.prisma.user.create({
            data: {
              email,
              name: dto.name.trim(),
              passwordHash,
            },
          });

    return this.issueSession(user, meta);
  }

  async login(dto: LoginDto, meta?: { userAgent?: string; ip?: string }) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const match = await this.verifyPassword(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (match === 'legacy') {
      const passwordHash = await this.hashPassword(dto.password);
      await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    }

    return this.issueSession(user, meta);
  }

  async refresh(rawRefresh: string | undefined, meta?: { userAgent?: string; ip?: string }) {
    if (!rawRefresh) throw new UnauthorizedException('Not authenticated');
    const tokenHash = this.sha256(rawRefresh);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    // Rotate: revoke old, issue new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueSession(stored.user, meta);
  }

  async logout(rawRefresh: string | undefined) {
    if (!rawRefresh) return { ok: true as const };
    const tokenHash = this.sha256(rawRefresh);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { ok: true as const };
  }

  async me(userId: number): Promise<AuthUserView> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) throw new UnauthorizedException();
    return this.toView(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always generic — do not reveal account existence
    const generic = {
      ok: true as const,
      message: 'If an account exists for that email, a reset link has been sent.',
    };
    if (!user?.passwordHash) return generic;

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const raw = crypto.randomBytes(32).toString('base64url');
    const tokenHash = this.sha256(raw);
    const expiresAt = new Date(Date.now() + 60 * 60_000); // 1 hour
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const origin = (process.env.FRONTEND_URL || 'http://localhost:3010').replace(/\/$/, '');
    const resetUrl = `${origin}/reset-password?token=${raw}`;

    // Email transport optional — never log the raw token in production logs at info level
    if (process.env.SMTP_URL || process.env.SMTP_HOST) {
      this.logger.warn(
        `Password reset requested for userId=${user.id} (configure SMTP delivery if not yet wired)`,
      );
      // Delivery wiring can be added when SMTP credentials exist; link not returned to client.
      void resetUrl;
    } else if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`DEV password reset link for ${email}: ${resetUrl}`);
    }

    return generic;
  }

  async resetPassword(dto: ResetPasswordDto) {
    this.assertPasswordMatch(dto.password, dto.confirmPassword);
    const tokenHash = this.sha256(dto.token);
    const stored = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!stored || stored.usedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await this.hashPassword(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { ok: true as const };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) throw new UnauthorizedException();

    const match = await this.verifyPassword(dto.currentPassword, user.passwordHash);
    if (!match) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await this.hashPassword(dto.newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { ok: true as const };
  }
}
