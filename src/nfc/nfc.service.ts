import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AssignNfcTagDto } from './dto/assign-nfc-tag.dto';
import { AuthUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class NfcService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assign an NFC tag UID to a student.
   *
   * Rules:
   * - studentId must reference an existing Student record
   * - uid must be globally unique (no two students share the same physical tag)
   * - If the student already has an active tag, it is deactivated first (replaced)
   * - The assigning admin's id is stored on the record
   */
  async assignTag(studentId: string, dto: AssignNfcTagDto, admin: AuthUser) {
    // 1. Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with id "${studentId}" not found`);
    }

    // 2. Reject duplicate UID
    const existingTag = await this.prisma.nfcTag.findUnique({
      where: { uid: dto.uid },
    });

    if (existingTag) {
      throw new ConflictException(
        `NFC tag with uid "${dto.uid}" is already assigned to another student`,
      );
    }

    // 3. Deactivate any existing active tag for this student (safe replacement)
    await this.prisma.nfcTag.updateMany({
      where: { studentId, isActive: true },
      data: { isActive: false },
    });

    // 4. Create the new tag assignment
    const nfcTag = await this.prisma.nfcTag.create({
      data: {
        uid: dto.uid,
        studentId,
        assignedById: admin.id,
        isActive: true,
      },
      select: {
        id: true,
        uid: true,
        studentId: true,
        assignedById: true,
        isActive: true,
        assignedAt: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return { nfcTag };
  }
}
