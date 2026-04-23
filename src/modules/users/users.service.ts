import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma, Role, User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  private readonly defaultUserStatus = UserStatus.ACTIVE;

  private readonly userSelect = {
    id: true,
    fullName: true,
    email: true,
    phone: true,
    role: true,
    status: true,
    marketId: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  private mapUserStatus(status: UserStatus | null | undefined): UserStatus {
    return status ?? this.defaultUserStatus;
  }

  private serializeUser<T extends { status?: UserStatus | null }>(user: T) {
    return {
      ...user,
      status: this.mapUserStatus(user.status),
    };
  }

  // Barcha userlar - Role-based filtering
  async findAll(currentUser: User) {
    // SUPERADMIN - barcha users
    if ((currentUser.role as any) === 'SUPERADMIN') {
      const users = await this.prisma.user.findMany({
        select: this.userSelect,
        orderBy: { createdAt: 'desc' },
      });

      return users.map((user) => this.serializeUser(user));
    }

    // OWNER - faqat o'z marketining users
    if (currentUser.role === Role.OWNER) {
      const users = await this.prisma.user.findMany({
        where: {
          marketId: { not: null },
          workMarket: {
            ownerId: currentUser.id,
          },
        },
        select: this.userSelect,
        orderBy: { createdAt: 'desc' },
      });

      return users.map((user) => this.serializeUser(user));
    }

    // ADMIN, MANAGER, SELLER - faqat o'z marketining users
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.MANAGER ||
      currentUser.role === Role.SELLER
    ) {
      if (!currentUser.marketId) {
        throw new ForbiddenException('Market tayinlanmagan');
      }

      const users = await this.prisma.user.findMany({
        where: {
          marketId: currentUser.marketId,
        },
        select: this.userSelect,
        orderBy: { createdAt: 'desc' },
      });

      return users.map((user) => this.serializeUser(user));
    }

    throw new ForbiddenException("Ruxsat yo'q");
  }

  // User qo'shish
  async create(dto: CreateUserDto, currentUser: User) {
    if (
      (currentUser.role as any) !== 'OWNER' &&
      (currentUser.role as any) !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException("Xodim qo'shish huquqi yo'q");
    }

    // OWNER faqat o'z marketiga xodim qo'sha oladi
    if (currentUser.role === Role.OWNER) {
      if (!dto.marketId) {
        throw new ForbiddenException('marketId kiritilishi shart');
      }

      // Validate UUID format (DTO validation handles this, but adding extra safety)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(dto.marketId)) {
        throw new BadRequestException(
          'marketId must be a valid UUID v4 format',
        );
      }

      try {
        const market = await this.prisma.market.findUnique({
          where: { id: dto.marketId },
        });

        if (!market) {
          throw new NotFoundException('Market topilmadi');
        }

        if (market.ownerId !== currentUser.id) {
          throw new ForbiddenException('Bu market sizga tegishli emas');
        }
      } catch (error: any) {
        // If Prisma throws UUID validation error, catch it
        if (error.code === 'P2023') {
          throw new BadRequestException('marketId must be a valid UUID format');
        }
        // Re-throw our custom exceptions
        if (
          error instanceof NotFoundException ||
          error instanceof ForbiddenException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }
        throw error;
      }

      // OWNER faqat ADMIN, MANAGER, SELLER qo'sha oladi
      if ((dto.role as any) === 'OWNER' || (dto.role as any) === 'SUPERADMIN') {
        throw new ForbiddenException("Bu rolni qo'shish huquqi yo'q");
      }
    }

    // Email unique tekshirish
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Bu email bilan user allaqachon mavjud');
    }

    // Phone unique tekshirish
    if (dto.phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existingPhone) {
        throw new ConflictException(
          'Bu telefon raqam bilan user allaqachon mavjud',
        );
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    try {
      const createdUser = await this.prisma.user.create({
        data: {
          fullName: dto.fullName,
          email: dto.email,
          phone: dto.phone,
          password: hashedPassword,
          role: dto.role,
          marketId: dto.marketId,
          status: this.defaultUserStatus,
        },
        select: this.userSelect,
      });

      return this.serializeUser(createdUser);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException("User yaratishda takroriy ma'lumot aniqlandi");
      }

      throw new BadRequestException("User yaratishda xatolik yuz berdi");
    }
  }

  // Bitta user - Role-based access
  async findOne(id: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });

    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    // SUPERADMIN - barcha users
    if ((currentUser.role as any) === 'SUPERADMIN') {
      return this.serializeUser(user);
    }

    // OWNER - faqat o'z xodimlarini ko'radi
    if (currentUser.role === Role.OWNER) {
      if (user.marketId) {
        const market = await this.prisma.market.findFirst({
          where: { id: user.marketId, ownerId: currentUser.id },
        });
        if (!market) {
          throw new ForbiddenException("Ruxsat yo'q");
        }
      }
      return this.serializeUser(user);
    }

    // ADMIN, MANAGER, SELLER - faqat o'z marketining users
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.MANAGER ||
      currentUser.role === Role.SELLER
    ) {
      if (user.marketId !== currentUser.marketId) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
      return this.serializeUser(user);
    }

    throw new ForbiddenException("Ruxsat yo'q");
  }

  // User tahrirlash - Role-based access
  async update(id: string, dto: UpdateUserDto, currentUser: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    // SUPERADMIN - barcha users tahrirlaydi
    if ((currentUser.role as any) === 'SUPERADMIN') {
      // Fall through to update
    }
    // OWNER - faqat o'z xodimlarini tahrirlaydi
    else if (currentUser.role === Role.OWNER && user.marketId) {
      const market = await this.prisma.market.findFirst({
        where: { id: user.marketId, ownerId: currentUser.id },
      });
      if (!market) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    }
    // ADMIN - faqat o'z marketining users
    else if (currentUser.role === Role.ADMIN) {
      if (user.marketId !== currentUser.marketId) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    }
    // MANAGER, SELLER - o'z marketining userlarini tahrirlaya oladi
    else if (
      currentUser.role === Role.MANAGER ||
      currentUser.role === Role.SELLER
    ) {
      if (user.marketId !== currentUser.marketId) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    } else {
      throw new ForbiddenException("Ruxsat yo'q");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.role && { role: dto.role }),
        ...(dto.marketId && { marketId: dto.marketId }),
      },
      select: this.userSelect,
    });

    return this.serializeUser(updatedUser);
  }

  // User o'chirish - Role-based access
  async remove(id: string, currentUser: User) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    if (id === currentUser.id) {
      throw new ForbiddenException("O'zingizni o'chira olmaysiz");
    }

    // SUPERADMIN - barcha users o'chiradi
    if ((currentUser.role as any) === 'SUPERADMIN') {
      // Fall through to delete
    }
    // OWNER - faqat o'z xodimlarini o'chiradi
    else if (currentUser.role === Role.OWNER && user.marketId) {
      const market = await this.prisma.market.findFirst({
        where: { id: user.marketId, ownerId: currentUser.id },
      });
      if (!market) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    }
    // ADMIN - faqat o'z marketining users
    else if (currentUser.role === Role.ADMIN) {
      if (user.marketId !== currentUser.marketId) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    }
    // MANAGER - faqat o'z marketining lower role users
    else if (currentUser.role === Role.MANAGER) {
      if (user.marketId !== currentUser.marketId) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
      if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
        throw new ForbiddenException("Bu userni o'chira olmaysiz");
      }
    }
    // SELLER - o'chira olmaydi
    else if (currentUser.role === Role.SELLER) {
      throw new ForbiddenException("User o'chirish huquqi yo'q");
    } else {
      throw new ForbiddenException("Ruxsat yo'q");
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: "User muvaffaqiyatli o'chirildi" };
  }

  // User status o'zgartirish - Role-based access
  async updateStatus(id: string, status: UserStatus, currentUser: User) {
    if (!Object.values(UserStatus).includes(status)) {
      throw new BadRequestException("Noto'g'ri user status yuborildi");
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    if (id === currentUser.id) {
      throw new ForbiddenException("O'z statusingizni o'zgartira olmaysiz");
    }

    // SUPERADMIN - barcha users
    if ((currentUser.role as any) === 'SUPERADMIN') {
      // Fall through
    }
    // OWNER - o'z xodimlarining status
    else if (currentUser.role === Role.OWNER && user.marketId) {
      const market = await this.prisma.market.findFirst({
        where: { id: user.marketId, ownerId: currentUser.id },
      });
      if (!market) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    }
    // ADMIN - o'z marketining users
    else if (currentUser.role === Role.ADMIN) {
      if (user.marketId !== currentUser.marketId) {
        throw new ForbiddenException("Ruxsat yo'q");
      }
    }
    // MANAGER, SELLER - o'chira olmaydi
    else if (
      currentUser.role === Role.MANAGER ||
      currentUser.role === Role.SELLER
    ) {
      throw new ForbiddenException("Status o'zgartirish huquqi yo'q");
    } else {
      throw new ForbiddenException("Ruxsat yo'q");
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: this.userSelect,
    });

    return this.serializeUser(updatedUser);
  }
}
