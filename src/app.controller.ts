import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateUserDto } from './common/dto/create-user.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns API health status',
    schema: {
      example: { status: 'ok', timestamp: '2026-07-02T10:00:00.000Z' },
    },
  })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

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
