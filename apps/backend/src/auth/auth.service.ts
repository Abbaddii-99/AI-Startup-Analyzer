import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@ai-analyzer/db';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  }
}
