import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from './auth-cookies';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../users/guards/jwt-auth.guard';

type AuthedRequest = Request & { user?: { userId: number; email?: string | null } };

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private clientMeta(req: Request) {
    return {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
  }

  private writeSession(
    res: Response,
    session: Awaited<ReturnType<AuthService['issueSession']>>,
  ) {
    setAuthCookies(res, {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessMaxAgeMs: session.accessMaxAgeMs,
      refreshMaxAgeMs: session.refreshMaxAgeMs,
    });
    return { user: session.user };
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a new account (sets HttpOnly auth cookies)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 409 })
  async register(
    @Body() body: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.auth.register(body, this.clientMeta(req));
    return this.writeSession(res, session);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Login (sets HttpOnly auth cookies)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 401 })
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = await this.auth.login(body, this.clientMeta(req));
    return this.writeSession(res, session);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Rotate refresh token and issue new access cookie' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const session = await this.auth.refresh(raw, this.clientMeta(req));
    return this.writeSession(res, session);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token and clear auth cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(raw);
    clearAuthCookies(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user!.userId);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Request a password reset email (always generic response)' })
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.auth.forgotPassword(body);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reset password with a one-time token' })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.auth.resetPassword(body);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password while authenticated' })
  async changePassword(
    @Req() req: AuthedRequest,
    @Body() body: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.changePassword(req.user!.userId, body);
    // Force re-login after password change
    clearAuthCookies(res);
    return result;
  }
}
