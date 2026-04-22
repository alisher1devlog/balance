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
  ApiResponse,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateSimpleContractDto } from './dto/create-simple-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateContractStatusDto } from './dto/update-status.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import { GetContractsQueryDto } from './dto/get-contracts-query.dto';
import { CalculateContractDto } from './dto/calculate-contract.dto';
import { CalculateContractResponseDto } from './dto/calculate-contract-response.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';

@ApiTags('Contracts')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Get()
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Barcha shartnomalar' })
  @ApiQuery({
    name: 'marketId',
    required: true,
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiQuery({ name: 'search', required: false, example: 'Ali' })
  findAll(
    @Query() query: GetContractsQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.contractsService.findAll(
      query.marketId,
      query.search,
      currentUser,
    );
  }

  @Post()
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Shartnoma yaratish' })
  @ApiResponse({
    status: 201,
    description: 'Shartnoma muvaffaqiyatli yaratildi',
  })
  @ApiResponse({
    status: 400,
    description:
      "Validatsiya xatosi (mahsulot yetarli emas, noto'g'ri maydonlar, va h.k)",
  })
  @ApiResponse({
    status: 404,
    description: 'Mahsulot, xaridor, yoki bozor topilmadi',
  })
  create(@Body() dto: CreateContractDto, @CurrentUser() currentUser: User) {
    return this.contractsService.create(dto, currentUser);
  }

  @Post('calculate')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SELLER)
  @ApiOperation({ summary: 'Shartnoma hisob-kitoblarini hisoblash' })
  @ApiResponse({
    status: 200,
    description: 'Hisob-kitoblar muvaffaqiyatli hisoblandi',
    type: CalculateContractResponseDto,
  })
  calculate(
    @Body() dto: CalculateContractDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.contractsService.calculate(dto, currentUser);
  }

  @Post('create-simple')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({
    summary: 'Shartnoma yaratish (sodda forma)',
    description:
      'Bitta mahsulot uchun shartnoma yaratish. Bozor ID va sana avtomatik tuziladi.',
  })
  @ApiResponse({
    status: 201,
    description: 'Shartnoma muvaffaqiyatli yaratildi',
  })
  createSimple(
    @Body() dto: CreateSimpleContractDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.contractsService.createSimple(dto, currentUser);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Bitta shartnoma' })
  findOne(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.contractsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Shartnoma tahrirlash' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContractDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.contractsService.update(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Shartnoma o'chirish (faqat DRAFT)" })
  remove(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.contractsService.remove(id, currentUser);
  }

  @Patch(':id/status')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Shartnoma statusini o'zgartirish" })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateContractStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.contractsService.updateStatus(id, dto.status, currentUser);
  }

  @Post(':id/pay')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: "To'lov qabul qilish" })
  pay(
    @Param('id') id: string,
    @Body() dto: PayInstallmentDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.contractsService.pay(id, dto, currentUser);
  }

  @Get(':id/installments')
  @Roles(Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: "Installmentlar ro'yxati" })
  getInstallments(@Param('id') id: string, @CurrentUser() currentUser: User) {
    return this.contractsService.getInstallments(id, currentUser);
  }
}
