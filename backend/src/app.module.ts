import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { QuranModule } from './quran/quran.module';
import { AudioModule } from './audio/audio.module';
import { SearchModule } from './search/search.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DonationsModule } from './donations/donations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
      },
    ]),
    PrismaModule,
    CacheModule,
    QuranModule,
    AudioModule,
    SearchModule,
    UsersModule,
    AuthModule,
    DonationsModule,
  ],
})
export class AppModule {}
