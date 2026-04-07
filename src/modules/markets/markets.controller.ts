import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketUserResponse } from './dto/market-users.response';
import { MarketUsersListResponse } from './dto/market-users-list.response';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';

@ApiTags('Markets')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('markets')
export class MarketsController {
  constructor(private marketsService: MarketsService) { }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: "Do'kon yaratish" })
  @ApiResponse({ status: 201, description: "Do'kon yaratildi" })
  create(@Body() dto: CreateMarketDto, @CurrentUser('id') userId: string) {
    return this.marketsService.create(dto, userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: "O'z do'konlarini ko'rish" })
  findMyMarkets(@CurrentUser('id') userId: string) {
    return this.marketsService.findMyMarkets(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: "Bitta do'kon" })
  findOne(@Param('id') id: string) {
    return this.marketsService.findOne(id);
  }

  @Get(':id/users')
  @UseGuards(RolesGuard)
  @Roles('SUPERADMIN' as any, Role.OWNER)
  @ApiOperation({ summary: "Do'konning xodimlarini ko'rish" })
  @ApiResponse({
    status: 200,
    description: "Do'konga tegishli xodimlar ro'yxati",
    type: MarketUsersListResponse,
  })
  @ApiResponse({
    status: 404,
    description: "Do'kon topilmadi",
  })
  @ApiResponse({
    status: 403,
    description: "Xodimlarni ko'rish huquqi yo'q",
  })
  findMarketUsers(
    @Param('id') marketId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.marketsService.findMarketUsers(marketId, currentUser);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: "Do'kon tahrirlash" })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMarketDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.marketsService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  @ApiOperation({ summary: "Do'kon o'chirish" })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.marketsService.remove(id, userId);
  }
}
