import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    } as StrategyOptionsWithoutRequest);
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // Use raw SQL to bypass enum validation issues
    const rows = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT id, status FROM users WHERE id = $1::uuid LIMIT 1`,
      payload.sub,
    );

    const user = rows && rows.length > 0 ? rows[0] : null;

    if (!user || user?.status !== 'ACTIVE') {
      throw new UnauthorizedException('User topilmadi yoki bloklangan');
    }

    // Return payload with user info instead of full user object
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      status: user.status,
    };
  }
}
