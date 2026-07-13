import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';

@ApiTags('attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ─── Issue #18 – Create attendance session ────────────────────────────────────

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Create an attendance session',
    description:
      'Allows a SCHOOL_ADMIN or TEACHER to open a new attendance session ' +
      'for a school. The session is linked to the authenticated user as creator. ' +
      'endsAt must be strictly after startsAt.',
  })
  @ApiCreatedResponse({
    description: 'Session created successfully',
    schema: {
      example: {
        session: {
          id: 'uuid',
          schoolId: 'uuid-of-school',
          title: 'Mathematics – Period 3',
          startsAt: '2026-07-14T08:00:00.000Z',
          endsAt: '2026-07-14T09:00:00.000Z',
          locationName: 'Room 101',
          latitude: 6.5244,
          longitude: 3.3792,
          status: 'SCHEDULED',
          createdAt: '2026-07-14T07:50:00.000Z',
          createdBy: {
            id: 'uuid',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@school.edu',
            role: 'SCHOOL_ADMIN',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error or endsAt ≤ startsAt' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  createSession(
    @Body() dto: CreateAttendanceSessionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.attendanceService.createSession(dto, user);
  }
}
