import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private hash(password: string): string {
    return crypto.createHash('sha256').update(password + (process.env.JWT_SECRET || 'salt')).digest('hex');
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return null;
    const hash = this.hash(password);
    if (user.passwordHash !== hash) return null;
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const payload = { sub: user.id, email: user.email };
    return { access_token: this.jwt.sign(payload) };
  }
}
