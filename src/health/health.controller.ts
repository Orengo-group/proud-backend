import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is up and running',
    schema: {
      example: { status: 'ok', service: 'proud-backend' },
    },
  })
  check(): { status: string; service: string } {
    return { status: 'ok', service: 'proud-backend' };
  }
}
