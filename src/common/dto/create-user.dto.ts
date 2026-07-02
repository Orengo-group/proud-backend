import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export enum UserRole {
  STUDENT = 'STUDENT',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  SPONSOR = 'SPONSOR',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Sample DTO demonstrating global ValidationPipe with class-validator decorators.
 *
 * The global ValidationPipe (configured in main.ts) will:
 *  - Strip any fields not listed here (whitelist: true)
 *  - Reject requests that include unknown fields (forbidNonWhitelisted: true)
 *  - Return structured 400 errors for any violated constraint
 */
export class CreateUserDto {
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
    description: 'Password – minimum 8 characters',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Lagos, Nigeria', description: 'Optional city/location' })
  @IsOptional()
  @IsString()
  location?: string;
}
