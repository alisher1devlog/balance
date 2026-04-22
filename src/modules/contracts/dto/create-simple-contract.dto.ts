import { IsUUID, IsNumber, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Simplified contract creation DTO for direct product selection
 * Frontend sends this simple structure and the backend handles derivation of:
 * - marketId (from customer's market)
 * - startDate (today's date)
 * - items array (from productId)
 */
export class CreateSimpleContractDto {
  @ApiProperty({
    description: 'Customer ID (UUID format)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
  })
  @IsUUID('4', { message: "Xaridor ID noto'g'ri format (UUID bo'lishi kerak)" })
  customerId!: string;

  @ApiProperty({
    description: 'Product ID (UUID format)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d481',
  })
  @IsUUID('4', {
    message: "Mahsulot ID noto'g'ri format (UUID bo'lishi kerak)",
  })
  productId!: string;

  @ApiProperty({
    description: "Down payment amount in so'm (optional, default 0)",
    example: 2000000,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: "Boshlang'ich to'lov raqam bo'lishi kerak" })
  @Min(0, { message: "Boshlang'ich to'lov manfiy bo'lmaydi" })
  @Type(() => Number)
  downPayment?: number;

  @ApiProperty({
    description: 'Contract term in months (1-60)',
    example: 12,
  })
  @IsInt({ message: "Muddat butun son bo'lishi kerak" })
  @Min(1, { message: "Muddat 1 oydan kam bo'lmaydi" })
  @Type(() => Number)
  months!: number;
}
