import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class AdminBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(AdminBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureAdminUser();
  }

  private async ensureAdminUser() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME?.trim() || 'Admin';

    if (!email && !password) return;

    if (!email || !password) {
      this.logger.warn(
        'ADMIN_EMAIL and ADMIN_PASSWORD must both be set to bootstrap the admin account. Skipping.',
      );
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      this.logger.warn(
        `ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters. Admin bootstrap skipped.`,
      );
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const existing = await this.prisma.user.findUnique({ where: { email } });

      if (existing) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            name: existing.name?.trim() ? existing.name : name,
            passwordHash,
          },
        });
        this.logger.log(`Admin account updated for ${email}`);
      } else {
        await this.prisma.user.create({
          data: { email, name, passwordHash },
        });
        this.logger.log(`Admin account created for ${email}`);
      }
    } catch (err) {
      this.logger.error(`Failed to bootstrap admin user (${email})`, err);
    }
  }
}
