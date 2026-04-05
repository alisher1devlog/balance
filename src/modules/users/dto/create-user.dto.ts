import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'Alisher Yondoshev' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ enum: [Role.ADMIN, Role.MANAGER, Role.SELLER] })
  @IsEnum([Role.ADMIN, Role.MANAGER, Role.SELLER])
  role!: Role;

  @ApiPropertyOptional({ example: 'market-uuid' })
  @IsOptional()
  @IsString()
  marketId?: string;
}
