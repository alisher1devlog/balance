import { ApiProperty } from '@nestjs/swagger';

export class CalculateContractResponseDto {
  @ApiProperty({
    description: 'Product price (base price)',
    example: 12000000,
  })
  productPrice!: number;

  @ApiProperty({
    description: 'Down payment amount',
    example: 2000000,
  })
  downPayment!: number;

  @ApiProperty({
    description: 'Remaining amount to be paid through installments',
    example: 10000000,
  })
  remainingAmount!: number;

  @ApiProperty({
    description: 'Number of months',
    example: 12,
  })
  months!: number;

  @ApiProperty({
    description: 'Monthly payment amount',
    example: 833333.33,
  })
  monthlyPayment!: number;
}
