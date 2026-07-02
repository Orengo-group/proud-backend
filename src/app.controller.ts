import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateUserDto } from './common/dto/create-user.dto';

@ApiTags('demo')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Demo endpoint — shows the global ValidationPipe rejecting invalid payloads.
   * Uses CreateUserDto which is decorated with class-validator constraints.
   * Invalid or missing fields return a structured 400 response automatically.
   */
  @Post('example/create-user')
  @HttpCode(201)
  @ApiOperation({ summary: 'Demo: validated user creation (ValidationPipe showcase)' })
  @ApiResponse({ status: 201, description: 'Payload passed all validation rules' })
  @ApiResponse({ status: 400, description: 'Validation failed – structured error returned' })
  createUserExample(@Body() dto: CreateUserDto): { received: CreateUserDto } {
    return { received: dto };
  }
}
