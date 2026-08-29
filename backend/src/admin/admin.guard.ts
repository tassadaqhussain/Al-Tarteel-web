import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { isAdminUser } from './admin-access';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      user?: { email?: string | null; isAdmin?: boolean };
    }>();
    if (!isAdminUser(request.user)) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
