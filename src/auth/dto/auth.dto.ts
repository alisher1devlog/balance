import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterOwnerDto {
  @ApiProperty({
    example: 'Ali Valiyev',
    description: 'Foydalanuvchi toliq ismi(Familya Ism)!',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiPropertyOptional({
    example: '+998901234567',
    description: "Telefon raqam (Email bo'lmasa majburiy)",
  })
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: 'Telefon raqam kiritilishi shart' })
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'ali@gmail.com',
    description: "Email (Telefon bo'lmasa majburiy)",
  })
  @ValidateIf((o) => !o.phone)
  @IsNotEmpty({ message: 'Telefon yoki Email dan biri kiritilishi shart!' })
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Parol',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Parol kamida 6 ta belgi bo'lishi kerak" })
  password: string;
}

export class LoginDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'Login (Telefon yoki Email)',
  })
  @IsNotEmpty()
  @IsString()
  login: string;

  @ApiProperty({ example: 'password123', description: 'Parol' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
