import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { NfcService } from './nfc.service';
import { AssignNfcTagDto } from './dto/assign-nfc-tag.dto';

@ApiTags('nfc')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class NfcController {
  constructor(private readonly nfcService: NfcService) {}

  // ─── Issue #16 – Assign NFC tag to student ────────────────────────────────────

  @Post(':studentId/nfc-tags')
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Assign an NFC tag to a student',
    description:
      'Assigns a physical NFC card UID to a student profile. ' +
      'If the student already has an active tag it is deactivated first. ' +
      'Duplicate UIDs across all students are rejected.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'UUID of the student record',
    example: 'uuid-of-student',
  })
  @ApiCreatedResponse({
    description: 'NFC tag successfully assigned',
    schema: {
      example: {
        nfcTag: {
          id: 'uuid',
          uid: '04:A3:B2:C1:D0:E9:F8',
          studentId: 'uuid-of-student',
          assignedById: 'uuid-of-admin',
          isActive: true,
          assignedAt: '2026-01-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
          student: { id: 'uuid', name: 'Jane Doe', studentId: 'STU-001' },
          assignedBy: {
            id: 'uuid',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@school.edu',
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiConflictResponse({ description: 'NFC UID already in use' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Insufficient role' })
  assignTag(
    @Param('studentId') studentId: string,
    @Body() dto: AssignNfcTagDto,
    @CurrentUser() admin: AuthUser,
  ) {
    return this.nfcService.assignTag(studentId, dto, admin);
  }
}
