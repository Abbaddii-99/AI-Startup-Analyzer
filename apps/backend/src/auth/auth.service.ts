import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { prisma } from '../prisma';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService, private config: ConfigService) {}

  private signAccess(userId: string, email: string) {
    return this.jwtService.sign({ userId, email });
  }

  private async createRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
    return token;
  }

  async createRefreshTokenPublic(userId: string): Promise<string> {
    return this.createRefreshToken(userId);
  }

  private userResponse(user: any) {
    return { id: user.id, email: user.email, name: user.name, plan: user.plan };
  }

  async register(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already in use');
    if (password.length < 8) throw new ConflictException('Password must be at least 8 characters');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, password: hashedPassword, name } });

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(user.id, user.email),
      this.createRefreshToken(user.id),
    ]);

    this.logger.log(`New user registered: ${user.id}`);
    return { user: this.userResponse(user), accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(user.id, user.email),
      this.createRefreshToken(user.id),
    ]);

    return { user: this.userResponse(user), accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const record = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      if (record) await prisma.refreshToken.delete({ where: { id: record.id } });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: record.id } });
    const [accessToken, newRefreshToken] = await Promise.all([
      this.signAccess(record.user.id, record.user.email),
      this.createRefreshToken(record.user.id),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async findOrCreateGoogleUser(googleUser: { email: string; name: string; googleId: string }) {
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
    if (!user) {
      const unusablePassword = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
      user = await prisma.user.create({
        data: { email: googleUser.email, name: googleUser.name, password: unusablePassword },
      });
      this.logger.log(`New Google user registered: ${user.id}`);
    }
    return user;
  }

  async checkAnalysisLimit(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (user.monthResetAt < monthStart) {
      await prisma.user.update({
        where: { id: userId },
        data: { analysesThisMonth: 0, monthResetAt: now },
      });
      user.analysesThisMonth = 0;
    }

    const limits: Record<string, number> = { FREE: 3, PRO: 50, TEAM: 999 };
    const limit = limits[user.plan] ?? 3;

    if (user.analysesThisMonth >= limit) {
      throw new ConflictException(
        `Monthly limit reached (${limit} analyses for ${user.plan} plan). Upgrade to get more.`,
      );
    }
  }

  async incrementAnalysisCount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { analysesThisMonth: { increment: 1 } },
    });
  }
}
