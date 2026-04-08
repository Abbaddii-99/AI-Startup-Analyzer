import { Controller, Post, Get, Body, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto, RefreshDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ short: { ttl: 60000, limit: 5 }, long: { ttl: 3600000, limit: 20 } })
  async register(@Body() body: RegisterDto, @Res() res: any) {
    const result = await this.authService.register(body.email, body.password, body.name);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return res.json({ user: result.user });
  }

  @Post('login')
  @Throttle({ short: { ttl: 60000, limit: 10 }, long: { ttl: 3600000, limit: 50 } })
  async login(@Body() body: LoginDto, @Res() res: any) {
    const result = await this.authService.login(body.email, body.password);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return res.json({ user: result.user });
  }

  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body() body: RefreshDto) {
    if (body.refreshToken) await this.authService.logout(body.refreshToken);
    return { message: 'Logged out' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: any) {
    const user = await this.authService.findOrCreateGoogleUser(req.user);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({ userId: user.id, email: user.email }),
      this.authService.createRefreshTokenPublic(user.id),
    ]);
    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${frontendUrl}/auth/callback`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return { user: { id: req.user.userId, email: req.user.email } };
  }
}
