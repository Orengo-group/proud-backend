import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Declares which roles are allowed to access a route.
 *
 * Usage:
 *   @Roles(Role.SCHOOL_ADMIN, Role.TEACHER)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Get('students')
 *   findStudents() {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
