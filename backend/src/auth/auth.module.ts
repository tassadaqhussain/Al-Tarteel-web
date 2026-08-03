import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-me',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
