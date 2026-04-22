import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus, Role, User } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async checkMarketAccess(marketId: string, currentUser: User) {
    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
    });
    if (!market) throw new NotFoundException('Market topilmadi');
    if (currentUser.role === Role.SUPERADMIN) return market;
    if (currentUser.role === Role.OWNER && market.ownerId !== currentUser.id)
      throw new ForbiddenException("Bu marketga ruxsat yo'q");
    if (currentUser.role !== Role.OWNER && currentUser.marketId !== marketId)
      throw new ForbiddenException("Bu marketga ruxsat yo'q");
    return market;
  }

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
            { name: { contains: searchQuery, mode: 'insensitive' as const } },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive' as const,
              },
            },
            {
              category: {
                name: { contains: searchQuery, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : { marketId };

    return this.prisma.product.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { contractItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateProductDto, currentUser: User) {
    await this.checkMarketAccess(dto.marketId, currentUser);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Kategoriya topilmadi');
    if (category.marketId !== dto.marketId)
      throw new ForbiddenException('Kategoriya bu marketga tegishli emas');

    return this.prisma.product.create({
      data: {
        marketId: dto.marketId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        stock: dto.stock,
        basePrice: dto.basePrice,
        status: 'ACTIVE',
      },
      include: { category: true },
    });
  }

  async findOne(id: string, currentUser: User) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    await this.checkMarketAccess(product.marketId, currentUser);
    return product;
  }

  async update(id: string, dto: UpdateProductDto, currentUser: User) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    await this.checkMarketAccess(product.marketId, currentUser);

    return this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        stock: dto.stock,
        basePrice: dto.basePrice,
      },
      include: { category: true },
    });
  }

  async updateStatus(id: string, status: ProductStatus, currentUser: User) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    await this.checkMarketAccess(product.marketId, currentUser);

    return this.prisma.product.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, status: true },
    });
  }

  async archiveProduct(id: string, currentUser: User) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    await this.checkMarketAccess(product.marketId, currentUser);

    await this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
    return { message: 'Mahsulot muvaffaqiyatli arxivlandi' };
  }

  async deleteProduct(id: string, currentUser: User) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        contractItems: { select: { id: true } },
      },
    });
    if (!product) throw new NotFoundException('Mahsulot topilmadi');
    await this.checkMarketAccess(product.marketId, currentUser);

    if ((product.contractItems as any).length > 0) {
      throw new ConflictException(
        "Bu mahsulot qayta o'tkazuvchi shartnomalardan foydalanilmoqda, uni o'chirish mumkin emas",
      );
    }

    await this.prisma.product.delete({ where: { id } });
    return { message: "Mahsulot doimiy o'chirildi" };
  }
}
