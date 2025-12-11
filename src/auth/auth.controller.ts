import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterOwnerDto } from './dto/auth.dto';

@ApiTags('Auth (Kirish tizimi!)')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Yangi Owner ro'yhatdan o'tish uchun!" })
  @ApiResponse({ status: 201, description: 'User yaratildi va token berildi!' })
  @Post('register-owner')
  registerOwner(@Body() dto: RegisterOwnerDto) {
    return this.authService.registerOwner(dto);
  }

  @ApiOperation({ summary: 'Tizimga kirish (Login)' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirdi!' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
