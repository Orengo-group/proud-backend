import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { SessionStatus } from '@prisma/client';

/**
 * Custom validator: endsAt must be strictly after startsAt.
 */
@ValidatorConstraint({ name: 'EndsAfterStarts', async: false })
class EndsAfterStartsConstraint implements ValidatorConstraintInterface {
  validate(endsAt: string, args: ValidationArguments): boolean {
    const obj = args.object as CreateAttendanceSessionDto;
    if (!obj.startsAt || !endsAt) return true; // let other validators catch missing
    return new Date(endsAt) > new Date(obj.startsAt);
  }

  defaultMessage(): string {
    return 'endsAt must be after startsAt';
  }
}

export class CreateAttendanceSessionDto {
  @ApiProperty({
    description: 'ID of the school this session belongs to',
    example: 'uuid-of-school',
  })
  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @ApiProperty({
    description: 'Human-readable title for the session',
    example: 'Mathematics – Period 3',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'ISO 8601 datetime when the session starts',
    example: '2026-07-14T08:00:00.000Z',
  })
  @IsDateString()
  startsAt: string;

  @ApiProperty({
    description: 'ISO 8601 datetime when the session ends (must be after startsAt)',
    example: '2026-07-14T09:00:00.000Z',
  })
  @IsDateString()
  @Validate(EndsAfterStartsConstraint)
  endsAt: string;

  @ApiPropertyOptional({
    description: 'Optional venue / location name',
    example: 'Room 101',
  })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({
    description: 'GPS latitude of the session venue',
    example: 6.5244,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'GPS longitude of the session venue',
    example: 3.3792,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Initial session status',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
    example: SessionStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;
}
