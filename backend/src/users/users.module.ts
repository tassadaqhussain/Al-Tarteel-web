import { Module } from '@nestjs/common';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-me',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as JwtSignOptions['expiresIn'],
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule {}
