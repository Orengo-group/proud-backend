import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects routes by validating the Bearer JWT in the Authorization header.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('protected')
 *   getProtected(@CurrentUser() user: AuthUser) {}
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
