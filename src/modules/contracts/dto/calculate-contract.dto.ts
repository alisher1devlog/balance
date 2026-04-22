import { IsUUID, IsNumber, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CalculateContractDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID('4', { message: "Product ID noto'g'ri format" })
  productId!: string;

  @ApiProperty({
    description: 'Down payment amount',
    example: 2000000,
  })
  @IsNumber({}, { message: "Boshlang'ich to'lov raqam bo'lishi kerak" })
  @Min(0, { message: "Boshlang'ich to'lov 0 dan kam bo'lmaydi" })
  @Type(() => Number)
  downPayment!: number;

  @ApiProperty({
    description: 'Contract term in months',
    example: 12,
  })
  @IsInt({ message: "Muddat butun son bo'lishi kerak" })
  @Min(1, { message: "Muddat 1 oydan kam bo'lmaydi" })
  @Type(() => Number)
  months!: number;
}
