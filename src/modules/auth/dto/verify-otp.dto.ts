import { IsEmail, IsString, Length, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  otp!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9...' })
  @IsString()
  otpToken!: string;

  @ApiProperty({
    example: 'register',
    description: 'register yoki reset_password',
    required: false,
  })
  @IsOptional()
  @IsIn(['register', 'reset_password'])
  purpose?: 'register' | 'reset_password';
}
