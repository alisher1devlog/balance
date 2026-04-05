import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ── 1. Barcha userlar ──────────────────────────────
  async findAll(currentUser: User) {
    // SUPERADMIN — barcha userlarni ko'radi
    if ((currentUser.role as any) === 'SUPERADMIN') {
      return this.prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          marketId: true,
          subEndDate: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // OWNER — faqat o'z market xodimlarini ko'radi
    if (currentUser.role === Role.OWNER) {
      return this.prisma.user.findMany({
        where: {
          marketId: { not: null },
          workMarket: {
            ownerId: currentUser.id,
          },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          marketId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    throw new ForbiddenException("Ruxsat yo'q");
  }

  // ── 2. Xodim qo'shish ──────────────────────────────
  async create(dto: CreateUserDto, currentUser: User) {
    // Faqat OWNER xodim qo'sha oladi
    if (
      (currentUser.role as any) !== 'OWNER' &&
      (currentUser.role as any) !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException("Xodim qo'shish huquqi yo'q");
    }

    // OWNER faqat o'z marketiga qo'sha oladi
    if (currentUser.role === Role.OWNER) {
      if (!dto.marketId) {
        throw new ForbiddenException('marketId kiritilishi shart');
      }

      const market = await this.prisma.market.findFirst({
        where: { id: dto.marketId, ownerId: currentUser.id },
      });

      if (!market) {
        throw new ForbiddenException('Bu market sizga tegishli emas');
      }

      // OWNER faqat ADMIN, MANAGER, SELLER qo'sha oladi
      if ((dto.role as any) === 'OWNER' || (dto.role as any) === 'SUPERADMIN') {
        throw new ForbiddenException("Bu rolni qo'shish huquqi yo'q");
      }
    }

    // Email takrorlanmasin
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Bu email allaqachon mavjud');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: dto.role,
        marketId: dto.marketId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        marketId: true,
        createdAt: true,
      },
    });

    return user;
  }

  // ── 3. Bitta user ──────────────────────────────────
  async findOne(id: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        marketId: true,
        subEndDate: true,
        createdAt: true,
        workMarket: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User topilmadi');

    // OWNER faqat o'z xodimlarini ko'ra oladi
    if (currentUser.role === Role.OWNER) {
      const isMyWorker = await this.prisma.user.findFirst({
        where: {
          id,
          workMarket: { ownerId: currentUser.id },
        },
      });
      if (!isMyWorker) throw new ForbiddenException("Ruxsat yo'q");
    }

    return user;
  }

  // ── 4. User tahrirlash ─────────────────────────────
  async update(id: string, dto: UpdateUserDto, currentUser: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User topilmadi');

    // OWNER faqat o'z xodimlarini tahrirlay oladi
    if (currentUser.role === Role.OWNER) {
      const isMyWorker = await this.prisma.user.findFirst({
        where: { id, workMarket: { ownerId: currentUser.id } },
      });
      if (!isMyWorker) throw new ForbiddenException("Ruxsat yo'q");
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        role: dto.role,
        marketId: dto.marketId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        marketId: true,
        updatedAt: true,
      },
    });
  }

  // ── 5. User o'chirish ──────────────────────────────
  async remove(id: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User topilmadi');

    // O'zini o'chira olmaydi
    if (id === currentUser.id) {
      throw new ForbiddenException("O'zingizni o'chira olmaysiz");
    }

    // OWNER faqat o'z xodimlarini o'chira oladi
    if (currentUser.role === Role.OWNER) {
      const isMyWorker = await this.prisma.user.findFirst({
        where: { id, workMarket: { ownerId: currentUser.id } },
      });
      if (!isMyWorker) throw new ForbiddenException("Ruxsat yo'q");
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: "User muvaffaqiyatli o'chirildi" };
  }

  // ── 6. Status o'zgartirish ─────────────────────────
  async updateStatus(id: string, status: UserStatus, currentUser: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User topilmadi');

    if (id === currentUser.id) {
      throw new ForbiddenException("O'z statusingizni o'zgartira olmaysiz");
    }

    // OWNER faqat o'z xodimlarini bloklaya oladi
    if (currentUser.role === Role.OWNER) {
      const isMyWorker = await this.prisma.user.findFirst({
        where: { id, workMarket: { ownerId: currentUser.id } },
      });
      if (!isMyWorker) throw new ForbiddenException("Ruxsat yo'q");
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fullName: true,
        status: true,
      },
    });
  }
}
