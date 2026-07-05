import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'jane@school.edu', description: 'Registered email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng!Pass', description: 'Account password' })
  @IsString()
  @MinLength(8)
  password: string;
}
