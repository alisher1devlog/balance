import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateContractItemDto {
  @ApiProperty({
    description: 'Product ID (UUID format)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: "Mahsulot ID UUID formatida bo'lishi kerak" })
  productId!: string;

  @ApiProperty({
    description: 'Product quantity (must be at least 1)',
    example: 1,
  })
  @Type(() => Number)
  @IsInt({ message: "Miqdor butun son bo'lishi kerak" })
  @Min(1, { message: "Miqdor kamida 1 bo'lishi kerak" })
  quantity!: number;
}

export class CreateContractDto {
  @ApiProperty({
    description: 'Market ID (UUID format)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: "Bozor ID UUID formatida bo'lishi kerak" })
  marketId!: string;

  @ApiProperty({
    description: 'Customer ID (UUID format)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  @IsUUID('4', { message: "Xaridor ID UUID formatida bo'lishi kerak" })
  customerId!: string;

  @ApiProperty({
    description: 'Contract term in months (1-60)',
    example: 12,
  })
  @Type(() => Number)
  @IsInt({ message: "Muddat butun son bo'lishi kerak" })
  @Min(1, { message: "Muddat kamida 1 oy bo'lishi kerak" })
  termMonths!: number;

  @ApiPropertyOptional({
    description: 'Down payment amount (optional, default 0)',
    example: 2000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: "Boshlang'ich to'lov butun son bo'lishi kerak" })
  @Min(0, { message: "Boshlang'ich to'lov 0 dan kam bo'lmaydi" })
  downPayment?: number;

  @ApiProperty({
    description: 'Contract start date (ISO 8601 format: YYYY-MM-DD)',
    example: '2026-04-06',
  })
  @IsDateString(
    {},
    {
      message:
        "Boshlanish sanasi ISO 8601 formatida bo'lishi kerak (YYYY-MM-DD)",
    },
  )
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Additional notes/remarks (optional)',
    example: 'XarakterizacijaXarakterizacija',
  })
  @IsOptional()
  @IsString({ message: "Izoh matn bo'lishi kerak" })
  note?: string;

  @ApiProperty({
    type: [CreateContractItemDto],
    description: 'Contract items (minimum 1 item required)',
    example: [
      {
        productId: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
        quantity: 1,
      },
    ],
  })
  @IsArray({ message: "Mahsulotlar massiv bo'lishi kerak" })
  @ArrayMinSize(1, {
    message: "Shartnoma uchun kamida bitta mahsulot bo'lishi kerak",
  })
  @ValidateNested({ each: true })
  @Type(() => CreateContractItemDto)
  items!: CreateContractItemDto[];
}
