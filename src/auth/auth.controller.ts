import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser, AuthUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Issue #10 – Register ─────────────────────────────────────────────────────

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiCreatedResponse({
    description: 'Account created successfully',
    schema: {
      example: {
        user: {
          id: 'uuid',
          email: 'jane@school.edu',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'STUDENT',
          isActive: true,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─── Issue #11 – Login ────────────────────────────────────────────────────────

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive a JWT access token' })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'jane@school.edu', role: 'STUDENT' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─── Issue #12 – Protected route example ─────────────────────────────────────

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ description: 'Authenticated user profile' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  getMe(@CurrentUser() user: AuthUser) {
    return { user };
  }

  // ─── Issue #13 – RBAC example ─────────────────────────────────────────────────

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Example admin-only endpoint (SCHOOL_ADMIN, SUPER_ADMIN)' })
  @ApiOkResponse({ description: 'Access granted' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  adminOnly(@CurrentUser() user: AuthUser) {
    return { message: 'Welcome, admin!', user };
  }
}
