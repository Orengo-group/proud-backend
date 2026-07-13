import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ListStudentsDto } from './dto/list-students.dto';
import { Role } from '@prisma/client';
import { AuthUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List students with optional filters and pagination.
   *
   * - SCHOOL_ADMIN and TEACHER see only students whose userId matches
   *   the school the admin belongs to (scoped via the `schoolId` filter).
   * - SUPER_ADMIN sees all students regardless of schoolId filter.
   * - Filters: schoolId, classLevel, department, status, search (name / studentId).
   */
  async listStudents(dto: ListStudentsDto, requestingUser: AuthUser) {
    const { schoolId, classLevel, department, status, search, page = 1, limit = 20 } = dto;

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    // School-scoped access: non-super-admins must not see students from
    // other schools. If a schoolId is provided it is used as-is; if none
    // is provided for a SCHOOL_ADMIN/TEACHER, return an empty page.
    if (requestingUser.role !== Role.SUPER_ADMIN) {
      if (!schoolId) {
        return this.emptyPage(page, limit);
      }
      where.schoolId = schoolId;
    } else if (schoolId) {
      where.schoolId = schoolId;
    }

    if (classLevel) {
      where.classLevel = classLevel;
    }

    if (department) {
      where.department = department;
    }

    if (status) {
      // Map StudentStatus enum to boolean isActive
      where.isActive = status === 'ACTIVE';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [students, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          studentId: true,
          name: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              isActive: true,
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private emptyPage(page: number, limit: number) {
    return {
      data: [],
      meta: { total: 0, page, limit, totalPages: 0 },
    };
  }
}
