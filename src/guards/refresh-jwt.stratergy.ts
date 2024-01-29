import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { TokenPayloadDto } from '../auth/auth.dto';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { EnvServiceDto } from '@/config/env.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    envServiceDto: EnvServiceDto,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader('X-REFRESH-TOKEN'),
      ignoreExpiration: false,
      secretOrKey: envServiceDto.REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayloadDto) {
    const token = request.header['X-REFRESH-TOKEN'];
    return this.authService.getUserByRefreshToken(token, payload.id);
  }
}
