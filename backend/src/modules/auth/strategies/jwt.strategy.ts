import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokensService } from '../tokens.service';
import { AccessTokenPayload } from '../tokens.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(tokens: TokensService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['RS256'],
      secretOrKey: tokens.getPublicKey(),
    });
  }

  // Called only after signature + expiry are already verified by passport-jwt.
  async validate(payload: AccessTokenPayload) {
    return { id: payload.sub, role: payload.role, sessionId: payload.sessionId };
  }
}
