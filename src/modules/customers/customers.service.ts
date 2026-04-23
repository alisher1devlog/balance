import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma, Role, User } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) { }

  private normalizePassportSeria(passportSeria?: string | null) {
    const normalized = passportSeria?.trim();
    return normalized ? normalized : null;
  }

  private async ensurePassportSeriaUnique(
    passportSeria: string | null,
    customerId?: string,
  ) {
    if (!passportSeria) return;

    const existing = await this.prisma.customer.findFirst({
      where: {
        passportSeria,
        ...(customerId ? { id: { not: customerId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Bu passport seriya allaqachon mavjud.');
    }
  }

  private handleCustomerWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Bu passport seriya allaqachon mavjud.');
    }

    throw error;
  }

  // ── Market tekshirish helper ────────────────────────
  private async checkMarketAccess(marketId: string, currentUser: User) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
    });

    if (!market) throw new NotFoundException('Market topilmadi');

    if (currentUser.role === Role.SUPERADMIN) return market;

    if (currentUser.role === Role.OWNER) {
      if (market.ownerId !== currentUser.id) {
        throw new ForbiddenException("Bu marketga ruxsat yo'q");
      }
      return market;
    }

    // ADMIN, MANAGER, SELLER — o'z marketida ishlaydi
    if (currentUser.marketId !== marketId) {
      throw new ForbiddenException("Bu marketga ruxsat yo'q");
    }

    return market;
  }

  // ── 1. Barcha mijozlar ─────────────────────────────
  async findAll(marketId: string, currentUser: User) {
    if (!marketId || !marketId.trim()) {
      throw new BadRequestException('Market ID kerak. Marketni tanlang.');
    }

    await this.checkMarketAccess(marketId, currentUser);

    return this.prisma.customer.findMany({
      where: { marketId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        address: true,
        passportSeria: true,
        birthDate: true,
        note: true,
        createdAt: true,
        _count: {
          select: { contracts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── 2. Mijoz qo'shish ──────────────────────────────
  async create(dto: CreateCustomerDto, currentUser: User) {
    await this.checkMarketAccess(dto.marketId, currentUser);
    const passportSeria = this.normalizePassportSeria(dto.passportSeria);

    // Telefon takrorlanmasin
    const existing = await this.prisma.customer.findUnique({
      where: {
        marketId_phone: {
          marketId: dto.marketId,
          phone: dto.phone,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Bu telefon raqam allaqachon mavjud');
    }

    await this.ensurePassportSeriaUnique(passportSeria);

    try {
      return await this.prisma.customer.create({
        data: {
          marketId: dto.marketId,
          fullName: dto.fullName,
          phone: dto.phone,
          address: dto.address,
          passportSeria,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          note: dto.note,
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          address: true,
          passportSeria: true,
          birthDate: true,
          note: true,
          marketId: true,
          createdAt: true,
        },
      });
    } catch (error) {
      this.handleCustomerWriteError(error);
    }
  }

  // ── 3. Bitta mijoz ─────────────────────────────────
  async findOne(id: string, currentUser: User) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        phone: true,
        address: true,
        passportSeria: true,
        birthDate: true,
        note: true,
        marketId: true,
        createdAt: true,
        updatedAt: true,
        documents: {
          select: {
            id: true,
            type: true,
            fileName: true,
            fileUrl: true,
            createdAt: true,
          },
        },
        _count: {
          select: { contracts: true },
        },
      },
    });

    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    await this.checkMarketAccess(customer.marketId, currentUser);

    return customer;
  }

  // ── 4. Mijoz tahrirlash ────────────────────────────
  async update(id: string, dto: UpdateCustomerDto, currentUser: User) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    await this.checkMarketAccess(customer.marketId, currentUser);
    const passportSeria =
      dto.passportSeria !== undefined
        ? this.normalizePassportSeria(dto.passportSeria)
        : undefined;

    // Telefon o'zgarsa takrorlanmasin
    if (dto.phone && dto.phone !== customer.phone) {
      const existing = await this.prisma.customer.findUnique({
        where: {
          marketId_phone: {
            marketId: customer.marketId,
            phone: dto.phone,
          },
        },
      });
      if (existing)
        throw new ConflictException('Bu telefon raqam allaqachon mavjud');
    }

    if (passportSeria !== undefined && passportSeria !== customer.passportSeria) {
      await this.ensurePassportSeriaUnique(passportSeria, customer.id);
    }

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: {
          fullName: dto.fullName,
          phone: dto.phone,
          address: dto.address,
          ...(passportSeria !== undefined ? { passportSeria } : {}),
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          note: dto.note,
        },
        select: {
          id: true,
          fullName: true,
          phone: true,
          address: true,
          passportSeria: true,
          birthDate: true,
          note: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      this.handleCustomerWriteError(error);
    }
  }

  // ── 5. Mijoz o'chirish ─────────────────────────────
  async remove(id: string, currentUser: User) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    await this.checkMarketAccess(customer.marketId, currentUser);

    // Faqat OWNER va SUPERADMIN o'chira oladi
    if (
      currentUser.role !== Role.OWNER &&
      currentUser.role !== Role.SUPERADMIN
    ) {
      throw new ForbiddenException("O'chirish huquqi yo'q");
    }

    await this.prisma.customer.delete({ where: { id } });
    return { message: "Mijoz muvaffaqiyatli o'chirildi" };
  }

  // ── 6. Mijoz shartnomalar ──────────────────────────
  async findContracts(id: string, currentUser: User) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Mijoz topilmadi');

    await this.checkMarketAccess(customer.marketId, currentUser);

    return this.prisma.contract.findMany({
      where: { customerId: id },
      select: {
        id: true,
        contractNumber: true,
        totalAmount: true,
        paidAmount: true,
        remainAmount: true,
        monthlyAmount: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        items: {
          select: {
            productName: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
