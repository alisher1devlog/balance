import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaySubscriptionDto {
  @ApiProperty({ example: 'plan-uuid', description: 'Subscription plan UUID' })
  @IsUUID()
  @IsNotEmpty()
  planId!: string;
}
