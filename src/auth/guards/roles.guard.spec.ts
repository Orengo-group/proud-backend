import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

function buildMockContext(user: object | undefined, roles: Role[] | undefined) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles as Role[]);

  const guard = new RolesGuard(reflector);

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as any;

  return { guard, mockExecutionContext };
}

describe('RolesGuard', () => {
  it('allows access when no roles are required', () => {
    const { guard, mockExecutionContext } = buildMockContext(undefined, undefined);
    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('allows access when user has the required role', () => {
    const { guard, mockExecutionContext } = buildMockContext(
      { role: Role.SCHOOL_ADMIN },
      [Role.SCHOOL_ADMIN, Role.SUPER_ADMIN],
    );
    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('throws ForbiddenException when user role is not in required roles', () => {
    const { guard, mockExecutionContext } = buildMockContext(
      { role: Role.STUDENT },
      [Role.SCHOOL_ADMIN, Role.SUPER_ADMIN],
    );
    expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when there is no authenticated user', () => {
    const { guard, mockExecutionContext } = buildMockContext(undefined, [Role.SCHOOL_ADMIN]);
    expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
  });
});
