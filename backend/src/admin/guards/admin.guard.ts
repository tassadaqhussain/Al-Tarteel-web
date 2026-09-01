import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { isAdminUser } from '../admin.util';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      user?: { email?: string | null; isAdmin?: boolean };
    }>();
    if (!isAdminUser(req.user)) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
