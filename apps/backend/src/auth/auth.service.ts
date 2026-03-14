import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '../../../packages/db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name?: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    if (password.length < 8) {
      throw new ConflictException('Password must be at least 8 characters');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = this.jwtService.sign({ userId: user.id, email: user.email });
    this.logger.log(`New user registered: ${user.email}`);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }
}
