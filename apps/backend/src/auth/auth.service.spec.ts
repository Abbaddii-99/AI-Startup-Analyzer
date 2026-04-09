import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';

jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
  },
}));

const { prisma: prismaMock } = jest.requireMock('../prisma') as {
  prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
    };
  };
};

describe('AuthService smoke', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };
    service = new AuthService(jwtService as unknown as JwtService, {} as ConfigService);
  });

  it('registers a user and returns tokens', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    prismaMock.user.create.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      plan: 'FREE',
      password: 'hashed-password',
    });
    prismaMock.refreshToken.create.mockResolvedValueOnce({ id: 'rt-1' });

    const result = await service.register('user@example.com', 'SecurePass1!', 'User');

    expect(result.user.email).toBe('user@example.com');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBeTruthy();
    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.refreshToken.create).toHaveBeenCalledTimes(1);
  });

  it('blocks register if email already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' });

    await expect(service.register('user@example.com', 'SecurePass1!')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('logs in with valid credentials and returns tokens', async () => {
    const hashedPassword = await bcrypt.hash('SecurePass1!', 10);
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      plan: 'FREE',
      password: hashedPassword,
    });
    prismaMock.refreshToken.create.mockResolvedValueOnce({ id: 'rt-1' });

    const result = await service.login('user@example.com', 'SecurePass1!');

    expect(result.user.id).toBe('user-1');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    const hashedPassword = await bcrypt.hash('SecurePass1!', 10);
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User',
      plan: 'FREE',
      password: hashedPassword,
    });

    await expect(service.login('user@example.com', 'wrong-Pass1!')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
