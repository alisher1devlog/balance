import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterOwnerDto } from './dto/auth.dto';
import { Role, UserStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async registerOwner(dto: RegisterOwnerDto) {
    try {
      const checks: any[] = [];
      if (dto.phone) checks.push({ phone: dto.phone });
      if (dto.email) checks.push({ email: dto.email });

      if (checks.length > 0) {
        const existingUser = await this.prisma.user.findFirst({
          where: { OR: checks },
        });

        if (existingUser) {
          throw new ConflictException(
            'Bu telefon yoki email allaqachon mavjud!',
          );
        }
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dto.password, salt);

      const newOwner = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          phone: dto.phone || null,
          email: dto.email || null,
          password: hashedPassword,
          role: Role.OWNER,
          status: UserStatus.ACTIVE,
          subEndDate: null, // Cheksiz tekin
          planId: null,
          marketId: null,
        },
      });

      const loginIdentity = newOwner.phone || newOwner.email || '';
      return this.signToken(newOwner.id, loginIdentity, newOwner.role);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Telefon yoki Email band!');
        }
      }
      this.logger.error(`Register Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Tizimda xatolik yuz berdi! Iltimos keyinroq urining!',
      );
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [{ phone: dto.login }, { email: dto.login }],
        },
      });

      if (!user) {
        throw new UnauthorizedException('Login yoki parol xato!');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Login yoki parol xato!');
      }

      if (user.status === UserStatus.BLOCKED) {
        throw new ForbiddenException(
          "Sizning profilingiz bloklangan! Iltimos Admin bilan bog'laning",
        );
      }
      if (user.status === UserStatus.EXPIRED) {
        throw new ForbiddenException(
          "Obuna vaqti tugagan! Hisobni faollashtirish uchun to'lov qiling.",
        );
      }

      if (user.role === Role.OWNER && user.subEndDate) {
        if (new Date() > user.subEndDate) {
          await this.prisma.user
            .update({
              where: { id: user.id },
              data: { status: UserStatus.EXPIRED },
            })
            .catch((err) => {
              this.logger.error(
                `Statusni update qilishda xatolik ${err.message}`,
              );
            });
          throw new ForbiddenException(
            "Obuna vaqti tugagan. Iltimos, to'lov qiling",
          );
        }
      }

      if ((user.status as any) === UserStatus.EXPIRED) {
        throw new ForbiddenException(
          "Obuna vaqti tugagan! Hisobni faollashtirish uchun to'lov qiling.",
        );
      }

      const loginIdentity = user.phone || user.email || '';

      return this.signToken(user.id, loginIdentity, user.role);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error(`Login Error ${error.message}`, error.stack);
      throw new InternalServerErrorException('Kirishda xatolik yuz berdi');
    }
  }

  private async signToken(userId: string, login: string, role: Role) {
    try {
      const payload = {
        sub: userId,
        login,
        role,
      };

      const token = await this.jwt.signAsync(payload, {
        expiresIn: '30d',
        secret: process.env.JWT_SECRET,
      });

      return {
        message: 'Muvaffaqiyatli kirdingiz!',
        access_token: token,
        user: {
          id: userId,
          login,
          role,
        },
      };
    } catch (error) {
      this.logger.error(`Token genaration error ${error.message}`);
      throw new InternalServerErrorException('Token yaratishda xatolik!');
    }
  }
}
