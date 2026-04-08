import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback';

    if (!clientId || clientId === 'placeholder') throw new Error('GOOGLE_CLIENT_ID environment variable is required');
    if (!clientSecret || clientSecret === 'placeholder') throw new Error('GOOGLE_CLIENT_SECRET environment variable is required');

    super({
      clientID: clientId,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { emails, displayName } = profile;
    done(null, { email: emails[0].value, name: displayName });
  }
}
