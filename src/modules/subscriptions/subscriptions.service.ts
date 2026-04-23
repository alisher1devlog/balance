import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PaySubscriptionDto } from './dto/pay-subscription.dto';
import { Role, User } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) { }

  private hasActiveSubscription(user: Pick<User, 'planId' | 'subEndDate'>) {
    return Boolean(user.planId && user.subEndDate && user.subEndDate > new Date());
  }

  private async getUserSubscriptionState(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        planId: true,
        subEndDate: true,
        plan: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            description: true,
          },
        },
      },
    });
  }

  // ── 1. Barcha planlar ──────────────────────────────
  async findAllPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  // ── 2. Bitta plan ──────────────────────────────────
  async findOnePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException('Plan topilmadi');
    return plan;
  }

  // ── 3. Plan yaratish (SUPERADMIN) ──────────────────
  async createPlan(dto: CreatePlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        duration: dto.duration,
        price: dto.price,
        description: dto.description,
        isActive: dto.isActive ?? true,
      },
    });
  }

  // ── 4. Plan tahrirlash (SUPERADMIN) ────────────────
  async updatePlan(id: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException('Plan topilmadi');

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: dto.name,
        duration: dto.duration,
        price: dto.price,
        description: dto.description,
        isActive: dto.isActive,
      },
    });
  }

  // ── 5. Plan o'chirish (SUPERADMIN) ─────────────────
  async removePlan(id: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) throw new NotFoundException('Plan topilmadi');

    await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "Plan o'chirildi" };
  }

  // ── 6. Obuna to'lash (OWNER) ───────────────────────
  async pay(dto: PaySubscriptionDto, currentUser: User) {
    if (currentUser.role !== Role.OWNER) {
      throw new ForbiddenException("Faqat OWNER obuna to'lay oladi");
    }

    const user = await this.getUserSubscriptionState(currentUser.id);

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    // Market tekshirish
    const market = await this.prisma.market.findFirst({
      where: { ownerId: currentUser.id },
    });

    if (!market) {
      throw new BadRequestException(
        'Birinchi market yarating, keyin obuna sotib olishingiz mumkin',
      );
    }

    if (this.hasActiveSubscription(user)) {
      throw new ConflictException(
        'Sizda faol obuna mavjud. Yangi obuna olish uchun avval amaldagi obunani bekor qiling.',
      );
    }

    const now = new Date();
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId },
    });

    if (!plan) throw new NotFoundException('Plan topilmadi');
    if (!plan.isActive) throw new BadRequestException('Bu plan faol emas');

    const startDate = now;
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.duration);

    // Payment yaratish
    const payment = await this.prisma.payment.create({
      data: {
        userId: currentUser.id,
        planId: plan.id,
        amount: plan.price,
        startDate,
        endDate,
      },
    });

    // User ni yangilash
    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        planId: plan.id,
        subEndDate: endDate,
      },
    });

    return {
      message: 'Obuna muvaffaqiyatli faollashtirildi',
      subscription: {
        plan: {
          id: plan.id,
          name: plan.name,
          duration: plan.duration,
          price: plan.price.toString(),
        },
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      payment: {
        id: payment.id,
        amount: payment.amount.toString(),
      },
    };
  }

  async cancel(currentUser: User) {
    if (currentUser.role !== Role.OWNER) {
      throw new ForbiddenException('Faqat OWNER uchun');
    }

    const user = await this.getUserSubscriptionState(currentUser.id);

    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    if (!this.hasActiveSubscription(user)) {
      throw new BadRequestException("Bekor qilish uchun faol obuna topilmadi.");
    }

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        planId: null,
        subEndDate: null,
      },
    });

    return {
      message: 'Obuna muvaffaqiyatli bekor qilindi.',
      subscription: {
        plan: user.plan,
        subEndDate: null,
        isActive: false,
        cancelledAt: new Date().toISOString(),
      },
    };
  }

  // ── 7. Joriy obuna (OWNER) ─────────────────────────
  async getCurrent(currentUser: User) {
    if (currentUser.role !== Role.OWNER) {
      throw new ForbiddenException('Faqat OWNER uchun');
    }

    const user = await this.getUserSubscriptionState(currentUser.id);

    if (!user?.planId) {
      return { message: "Faol obuna yo'q", subscription: null };
    }

    const now = new Date();
    const isActive = user.subEndDate ? user.subEndDate > now : false;
    const daysLeft = user.subEndDate
      ? Math.ceil(
        (user.subEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
      : 0;

    return {
      subscription: {
        plan: user.plan,
        subEndDate: user.subEndDate,
        isActive,
        daysLeft: isActive ? daysLeft : 0,
      },
    };
  }

  // ── 8. To'lov tarixi (OWNER) ───────────────────────
  async getHistory(currentUser: User) {
    if (currentUser.role !== Role.OWNER) {
      throw new ForbiddenException('Faqat OWNER uchun');
    }

    return this.prisma.payment.findMany({
      where: { userId: currentUser.id },
      include: {
        plan: {
          select: {
            name: true,
            duration: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
