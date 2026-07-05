import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from '../decorators/current-user.decorator';

/**
 * Enforces role-based access on routes decorated with @Roles().
 *
 * Must be used after JwtAuthGuard so the authenticated user is
 * already attached to the request.
 *
 * Usage:
 *   @Roles(Role.SCHOOL_ADMIN)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('students')
 *   findStudents() {}
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator → route is open to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied – required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
