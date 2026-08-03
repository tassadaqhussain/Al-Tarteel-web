import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

class LoginDto {
  email!: string;
  password!: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password; returns JWT' })
  @ApiResponse({ status: 201, description: 'Returns access_token' })
  @ApiResponse({ status: 401 })
  async login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }
}
