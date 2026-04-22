import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateSimpleContractDto } from './dto/create-simple-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import { CalculateContractDto } from './dto/calculate-contract.dto';
import {
  Role,
  User,
  ContractStatus,
  InstallmentStatus,
  TransactionType,
} from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  // ── Market access tekshirish ───────────────────────
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

    if (currentUser.marketId !== marketId) {
      throw new ForbiddenException("Bu marketga ruxsat yo'q");
    }

    return market;
  }

  // ── Shartnoma raqami generatsiya ───────────────────
  private async generateContractNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const count = await this.prisma.contract.count();
    const number = String(count + 1).padStart(5, '0');

    return `CNT-${year}${month}-${number}`;
  }

  // ── 1. Barcha shartnomalar ─────────────────────────
  async findAll(marketId: string, search?: string, currentUser?: User) {
    await this.checkMarketAccess(marketId, currentUser as User);

    // Normalize search query
    const searchQuery = search ? search.trim() : '';
    const hasSearch = searchQuery.length > 0;

    // Build where clause with conditional search
    const where: any = hasSearch
      ? {
          marketId,
          OR: [
            {
              contractNumber: {
                contains: searchQuery,
                mode: 'insensitive' as const,
              },
            },
            { note: { contains: searchQuery, mode: 'insensitive' as const } },
            {
              customer: {
                fullName: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
            },
            {
              customer: {
                phone: { contains: searchQuery, mode: 'insensitive' as const },
              },
            },
            {
              staff: {
                fullName: {
                  contains: searchQuery,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : { marketId };

    return this.prisma.contract.findMany({
      where,
      select: {
        id: true,
        contractNumber: true,
        totalAmount: true,
        paidAmount: true,
        remainAmount: true,
        monthlyAmount: true,
        downPayment: true,
        termMonths: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        staff: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: { items: true, installments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── 2. Shartnoma yaratish ──────────────────────────
  async create(dto: CreateContractDto, currentUser: User) {
    await this.checkMarketAccess(dto.marketId, currentUser);

    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException(
        `Xaridor topilmadi: ID ${dto.customerId}. Xaridor ID to'g'ri ekanligini tekshiring.`,
      );
    }

    if (customer.marketId !== dto.marketId) {
      throw new BadRequestException(
        `Xaridor "${customer.fullName}" boshqa bozorga tegishli. Undo marketId: ${customer.marketId}`,
      );
    }

    const downPayment = dto.downPayment ?? 0;
    let totalAmount = 0;
    let monthlyAmount = 0;

    // ──── 1. Validate all products exist and have sufficient stock ────
    const itemsData = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, basePrice: true, stock: true },
        });

        if (!product) {
          throw new NotFoundException(
            `Mahsulot topilmadi: ID ${item.productId}. Mahsulot ID to'g'ri ekanligini tekshiring.`,
          );
        }

        const quantity = item.quantity; // Use exact value, already validated by DTO

        // Stock validation with proper error message
        if (product.stock < quantity) {
          throw new BadRequestException(
            `Mahsulot yetarli emas. "${product.name}" uchun omborda ${product.stock} ta mavjud, siz ${quantity} ta so'radingiz`,
          );
        }

        const itemTotal = Number(product.basePrice) * quantity;
        totalAmount += itemTotal;

        return {
          productId: item.productId,
          productName: product.name,
          quantity,
          unitPrice: product.basePrice,
          totalPrice: itemTotal,
        };
      }),
    );

    // ──── 2. Validate calculation fields ────
    const remainAmount = totalAmount - downPayment;

    if (remainAmount < 0) {
      throw new BadRequestException(
        `Boshlang'ich to'lov umumiy summadan katta bo'lishi mumkin emas (To'lov: ${downPayment.toLocaleString()}, Jami: ${totalAmount.toLocaleString()})`,
      );
    }

    // ──── 3. Validate term months ────
    if (dto.termMonths < 1) {
      throw new BadRequestException("Muddat kamida 1 oy bo'lishi kerak");
    }

    if (dto.termMonths > 60) {
      throw new BadRequestException(
        "Shartnoma davomiyligi 60 oydan ko'p bo'lmaydi",
      );
    }

    monthlyAmount = remainAmount / dto.termMonths;

    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + dto.termMonths);

    const contractNumber = await this.generateContractNumber();

    const contract = await this.prisma.$transaction(async (tx) => {
      const newContract = await tx.contract.create({
        data: {
          contractNumber,
          marketId: dto.marketId,
          customerId: dto.customerId,
          staffId: currentUser.id,
          termMonths: dto.termMonths,
          downPayment,
          totalAmount,
          monthlyAmount,
          paidAmount: downPayment,
          remainAmount,
          startDate,
          endDate,
          status: ContractStatus.ACTIVE,
          note: dto.note,
          items: {
            create: itemsData as any,
          },
        },
        include: {
          items: true,
          customer: {
            select: { id: true, fullName: true, phone: true },
          },
        },
      });

      if (downPayment > 0) {
        await tx.transaction.create({
          data: {
            contractId: newContract.id,
            staffId: currentUser.id,
            type: 'DOWNPAYMENT',
            amount: downPayment,
            note: "Boshlang'ich to'lov",
          },
        });
      }

      const installments = [];
      for (let i = 0; i < dto.termMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i + 1);

        installments.push({
          contractId: newContract.id,
          orderIndex: i + 1,
          dueDate,
          amount: monthlyAmount,
          status: i === 0 ? InstallmentStatus.DUE : InstallmentStatus.PENDING,
        });
      }

      await tx.installment.createMany({ data: installments });

      // ──── Decrement product stock (safe within transaction) ────
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newContract;
    });

    return contract;
  }

  // ── 2b. Shartnoma yaratish (sodda forma) ──────────
  async createSimple(dto: CreateSimpleContractDto, currentUser: User) {
    // Xaridorni topish
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
      select: { id: true, marketId: true, fullName: true },
    });

    if (!customer) {
      throw new NotFoundException(`Xaridor topilmadi: ID ${dto.customerId}`);
    }

    // Mahsulotni topish
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, name: true, basePrice: true, stock: true },
    });

    if (!product) {
      throw new NotFoundException(`Mahsulot topilmadi: ID ${dto.productId}`);
    }

    // Sotuvdan oldin ombor tekshirish
    if (product.stock < 1) {
      throw new BadRequestException(
        `"${product.name}" mahsulotning omborida yetarli miqdori yo'q (Hozir: ${product.stock} dona)`,
      );
    }

    // Boshlang'ich to'lovni tekshirish
    const downPayment = dto.downPayment ?? 0;
    const productPrice = Number(product.basePrice);

    if (downPayment < 0) {
      throw new BadRequestException("Boshlang'ich to'lov manfiy bo'lmaydi");
    }

    if (downPayment > productPrice) {
      throw new BadRequestException(
        `Boshlang\'ich to\'lov (${downPayment.toLocaleString()}) mahsulot narxidan (${productPrice.toLocaleString()}) ko'p bo'lmaydi`,
      );
    }

    // Muddat tekshirish
    if (dto.months < 1) {
      throw new BadRequestException(
        "Shartnoma davomiyligi kamida 1 oy bo'lishi kerak",
      );
    }

    if (dto.months > 60) {
      throw new BadRequestException(
        "Shartnoma davomiyligi 60 oydan ko'p bo'lmaydi",
      );
    }

    // Hisob-kitoblarni bajarish
    const remainAmount = productPrice - downPayment;
    const monthlyAmount = remainAmount / dto.months;

    // Shartnomayon sanalarini tuzish
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Vaqtni null qilish
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + dto.months);

    const contractNumber = await this.generateContractNumber();

    // Shartnomayon yaratish (kompleks formatda)
    const createDto: CreateContractDto = {
      marketId: customer.marketId,
      customerId: dto.customerId,
      termMonths: dto.months,
      downPayment,
      startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD formatida
      note: `Soddalashtirilgan forma orqali yaratilgan`,
      items: [
        {
          productId: dto.productId,
          quantity: 1,
        },
      ],
    };

    return this.create(createDto, currentUser);
  }

  // ── 2a. Shartnoma hisob-kitoblarini hisoblash ──────
  async calculate(dto: CalculateContractDto, currentUser: User) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      select: { id: true, name: true, basePrice: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Mahsulot topilmadi: ID ${dto.productId}. Mahsulot ID to'g'ri ekanligini tekshiring.`,
      );
    }

    if (dto.downPayment < 0) {
      throw new BadRequestException(
        `Boshlang'ich to'lov manfiy bo'lmaydi (Qiymat: ${dto.downPayment})`,
      );
    }

    const productPrice = Number(product.basePrice);

    if (dto.downPayment > productPrice) {
      throw new BadRequestException(
        `Boshlang'ich to'lov (${dto.downPayment.toLocaleString()}) "${product.name}" narxidan (${productPrice.toLocaleString()}) ko'p bo'lmaydi`,
      );
    }

    if (dto.months <= 0) {
      throw new BadRequestException(
        `Muddat 1 oydan kam bo'lmaydi (Qiymat: ${dto.months})`,
      );
    }

    if (dto.months > 60) {
      throw new BadRequestException(
        `Muddat 60 oydan ko'p bo'lmaydi (Qiymat: ${dto.months})`,
      );
    }

    const remainingAmount = productPrice - dto.downPayment;
    const monthlyPayment = remainingAmount / dto.months;

    return {
      productPrice,
      downPayment: dto.downPayment,
      remainingAmount,
      months: dto.months,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    };
  }

  // ── 3. Bitta shartnoma ─────────────────────────────
  async findOne(id: string, currentUser: User) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            passportSeria: true,
          },
        },
        staff: {
          select: { id: true, fullName: true },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        installments: {
          orderBy: { orderIndex: 'asc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        signature: true,
      },
    });

    if (!contract) throw new NotFoundException('Shartnoma topilmadi');
    await this.checkMarketAccess(contract.marketId, currentUser);

    return contract;
  }

  // ── 4. Shartnoma tahrirlash ────────────────────────
  async update(id: string, dto: UpdateContractDto, currentUser: User) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Shartnoma topilmadi');

    await this.checkMarketAccess(contract.marketId, currentUser);

    if (
      contract.status !== ContractStatus.DRAFT &&
      contract.status !== ContractStatus.ACTIVE
    ) {
      throw new BadRequestException('Bu shartnomani tahrirlash mumkin emas');
    }

    return this.prisma.contract.update({
      where: { id },
      data: { note: dto.note },
    });
  }

  // ── 5. Shartnoma o'chirish (faqat DRAFT) ──────────
  async remove(id: string, currentUser: User) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Shartnoma topilmadi');

    await this.checkMarketAccess(contract.marketId, currentUser);

    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException(
        "Faqat DRAFT holatidagi shartnomani o'chirish mumkin",
      );
    }

    await this.prisma.contract.delete({ where: { id } });
    return { message: "Shartnoma o'chirildi" };
  }

  // ── 6. Status o'zgartirish ─────────────────────────
  async updateStatus(id: string, status: ContractStatus, currentUser: User) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Shartnoma topilmadi');

    await this.checkMarketAccess(contract.marketId, currentUser);

    return this.prisma.contract.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        contractNumber: true,
        status: true,
      },
    });
  }

  // ── 7. To'lov qabul qilish ─────────────────────────
  async pay(id: string, dto: PayInstallmentDto, currentUser: User) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { installments: true },
    });

    if (!contract) throw new NotFoundException('Shartnoma topilmadi');
    await this.checkMarketAccess(contract.marketId, currentUser);

    if (contract.status !== ContractStatus.ACTIVE) {
      throw new BadRequestException(
        "Faqat ACTIVE shartnomaga to'lov qabul qilinadi",
      );
    }

    const installment = await this.prisma.installment.findUnique({
      where: { id: dto.installmentId },
    });

    if (!installment) throw new NotFoundException('Installment topilmadi');
    if (installment.contractId !== id)
      throw new BadRequestException(
        'Bu installment ushbu shartnomaга tegishli emas',
      );
    if (installment.status === InstallmentStatus.PAID)
      throw new BadRequestException("Bu installment allaqachon to'langan");

    const newPaidAmount = Number(installment.paidAmount) + dto.amount;
    const installmentAmount = Number(installment.amount);

    let newStatus: InstallmentStatus = installment.status;
    if (newPaidAmount >= installmentAmount) {
      newStatus = InstallmentStatus.PAID;
    } else {
      newStatus = InstallmentStatus.PARTIAL;
    }

    await this.prisma.$transaction(async (tx) => {
      // Installment yangilash
      await tx.installment.update({
        where: { id: dto.installmentId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
          paidAt: newStatus === InstallmentStatus.PAID ? new Date() : null,
        },
      });

      // Transaction yaratish
      await tx.transaction.create({
        data: {
          contractId: id,
          installmentId: dto.installmentId,
          staffId: currentUser.id,
          type: TransactionType.PAYMENT,
          amount: dto.amount,
          note: dto.note,
        },
      });

      // Shartnoma paidAmount va remainAmount yangilash
      await tx.contract.update({
        where: { id },
        data: {
          paidAmount: { increment: dto.amount },
          remainAmount: { decrement: dto.amount },
        },
      });

      // Barcha installmentlar to'langanmi?
      const unpaid = await tx.installment.count({
        where: {
          contractId: id,
          status: { not: 'PAID' },
        },
      });

      if (unpaid === 0) {
        await tx.contract.update({
          where: { id },
          data: { status: 'COMPLETED' },
        });
      }
    });

    return { message: "To'lov muvaffaqiyatli qabul qilindi" };
  }

  // ── 8. Installmentlar ro'yxati ─────────────────────
  async getInstallments(id: string, currentUser: User) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Shartnoma topilmadi');

    await this.checkMarketAccess(contract.marketId, currentUser);

    return this.prisma.installment.findMany({
      where: { contractId: id },
      orderBy: { orderIndex: 'asc' },
    });
  }
}
