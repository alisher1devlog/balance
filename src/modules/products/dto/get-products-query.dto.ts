import { IsUUID, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetProductsQueryDto {
  @ApiProperty({
    description: 'Market ID (required)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsNotEmpty({ message: 'Market ID majburiy' })
  @IsUUID('4', { message: "Market ID noto'g'ri format" })
  marketId: string = '';

  @ApiPropertyOptional({
    description: 'Search query (searches by name, description, category name)',
    example: 'laptop',
  })
  @IsOptional()
  @IsString({ message: "Search matn bo'lishi kerak" })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;
}
