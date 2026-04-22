import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class GetMarketUsersQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page raqami (default: 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Bir sahifada nechta natija (default: 10, max: 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'Ali',
    description: "Qidirish: ism, email yoki telefon bo'yicha",
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: Object.values(UserStatus),
    description: "Status bo'yicha filter",
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'fullName'],
    description: 'Tartiblash turi (foydalanilmaydi)',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
    description: "Tartiblash yo'nalishi: asc (kamroq), desc (ko'p)",
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
