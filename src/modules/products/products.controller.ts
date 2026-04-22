import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductStatusDto } from './dto/update-status.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';

@ApiTags('Products')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SELLER)
  @ApiOperation({ summary: 'Barcha mahsulotlar' })
  @ApiQuery({
    name: 'marketId',
    required: true,
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiQuery({ name: 'search', required: false, example: 'laptop' })
  findAll(@Query() query: GetProductsQueryDto, @CurrentUser() user: User) {
    return this.productsService.findAll(query.marketId, query.search, user);
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Mahsulot yaratish' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: User) {
    return this.productsService.create(dto, user);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SELLER)
  @ApiOperation({ summary: 'Bitta mahsulot' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Mahsulot tahrirlash' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Mahsulot statusini o'zgartirish" })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.updateStatus(id, dto.status, user);
  }

  @Patch(':id/archive')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Mahsulotni arxivlash (yumshaq o'chirish)" })
  archive(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.archiveProduct(id, user);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Mahsulotni butunlay o'chirish (doimiy o'chirish)" })
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.productsService.deleteProduct(id, user);
  }
}
