import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { StudentsService } from './students.service';
import { ListStudentsDto } from './dto/list-students.dto';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // ─── Issue #14 – List students ────────────────────────────────────────────────

  @Get()
  @Roles(Role.SCHOOL_ADMIN, Role.TEACHER, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'List students with optional filters and pagination',
    description:
      'Returns a paginated list of students. SCHOOL_ADMIN and TEACHER must supply `schoolId` to scope results to their school. SUPER_ADMIN may omit it to see all students.',
  })
  @ApiOkResponse({
    description: 'Paginated list of students',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            studentId: 'STU-001',
            name: 'Jane Doe',
            createdAt: '2026-01-01T00:00:00.000Z',
            user: {
              id: 'uuid',
              email: 'jane@school.edu',
              firstName: 'Jane',
              lastName: 'Doe',
              role: 'STUDENT',
              isActive: true,
            },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  listStudents(
    @Query() dto: ListStudentsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.studentsService.listStudents(dto, user);
  }
}
