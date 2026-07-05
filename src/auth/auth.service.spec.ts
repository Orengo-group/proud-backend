import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from './dto/register.dto';

const mockUser = {
  id: 'user-id-1',
  email: 'jane@school.edu',
  passwordHash: '$2b$12$hashedpassword',
  firstName: 'Jane',
  lastName: 'Doe',
  role: 'STUDENT' as any,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  // ─── register ─────────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@school.edu',
      password: 'Str0ng!Pass',
      role: UserRole.STUDENT,
    };

    it('creates a user and does not return the password hash', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-id',
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        isActive: true,
        createdAt: new Date(),
      });

      const result = await authService.register(dto);
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws ConflictException when email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      await expect(authService.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'jane@school.edu', password: 'Str0ng!Pass' };

    it('returns accessToken and user (without passwordHash) on valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.login(dto);
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when account is inactive', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ ...mockUser, isActive: false });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
