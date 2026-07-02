import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

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
}
