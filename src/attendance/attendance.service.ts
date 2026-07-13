import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { AuthUser } from '../auth/decorators/current-user.decorator';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new attendance session.
   *
   * - endsAt must be after startsAt (also enforced at DTO level)
   * - Session is linked to the school and the creating user
   * - Status defaults to SCHEDULED
   */
  async createSession(dto: CreateAttendanceSessionDto, creator: AuthUser) {
    // Double-check time ordering in the service layer for extra safety
    if (new Date(dto.endsAt) <= new Date(dto.startsAt)) {
      throw new BadRequestException('endsAt must be strictly after startsAt');
    }

    const session = await this.prisma.attendanceSession.create({
      data: {
        schoolId: dto.schoolId,
        title: dto.title,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        locationName: dto.locationName,
        latitude: dto.latitude,
        longitude: dto.longitude,
        createdById: creator.id,
        status: dto.status ?? SessionStatus.SCHEDULED,
      },
      select: {
        id: true,
        schoolId: true,
        title: true,
        startsAt: true,
        endsAt: true,
        locationName: true,
        latitude: true,
        longitude: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { session };
  }
}
