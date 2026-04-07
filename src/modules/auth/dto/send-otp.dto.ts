import { IsEmail, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'register',
    description: 'register yoki reset_password',
    required: false,
  })
  @IsOptional()
  @IsIn(['register', 'reset_password'])
  purpose?: 'register' | 'reset_password';
}
