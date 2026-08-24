import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { isAdminEmail } from '../admin.util';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: { email?: string | null } }>();
    const email = req.user?.email;
    if (!isAdminEmail(email)) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
