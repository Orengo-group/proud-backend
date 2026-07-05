import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  SPONSOR = 'SPONSOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class RegisterDto {
  @ApiProperty({ example: 'Jane', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'jane@school.edu', description: 'Valid email address' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Str0ng!Pass',
    description:
      'Password – minimum 8 characters, at least one uppercase letter, one digit, and one special character',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'Password must contain at least one uppercase letter, one digit, and one special character',
  })
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Role assigned to this user',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Lagos, Nigeria', description: 'Optional city/location' })
  @IsOptional()
  @IsString()
  location?: string;
}
