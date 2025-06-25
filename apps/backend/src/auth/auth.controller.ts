import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../decorators/Public';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { CurrentUser } from '../decorators/CurrentUser';
import type { User } from '@prisma/client';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /* ----------  LOGIN  ---------- */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.auth.login(dto);
  }

  /* ----------  REGISTER  ---------- */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ id: string; email: string }> {
    // Ton service fait un `select: { id, email, firstname }`
    // et tu ne renvoies que { id, email }
    return this.auth.register(dto);
  }

  /* ----------  VERIFY EMAIL  ---------- */
  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<{ message: string }> {
    return this.auth.verifyEmail(token);
  }

  /* ----------  REFRESH TOKEN  ---------- */
  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body('refresh_token') refreshToken: string,
  ): Promise<{ access_token: string; refresh_token?: string }> {
    // Ton service renvoie soit { access_token, refresh_token } à la login,
    // soit uniquement { access_token } ici : on autorise le champ optionnel.
    return this.auth.refreshToken(refreshToken);
  }

  /* ----------  FORGOT-PASSWORD  ---------- */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async newForgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ code: number; title: string; description: string } | null> {
    return this.auth.newForgotPassword(dto);
  }

  @Public()
  @Get('forgot-password')
  async checkResetToken(
    @Query('token') token: string,
  ): Promise<{ title: string; description: string; code: number }> {
    const result = await this.auth.validateResetToken(token);

    if (result.code !== 200) {
      throw new HttpException(
        {
          title: result.title,
          description: result.description,
          code: result.code,
        },
        result.code,
      );
    }

    return {
      title: result.title,
      description: result.description,
      code: result.code,
    };
  }

  @Public()
  @Put('forgot-password')
  @HttpCode(HttpStatus.CREATED)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ title: string; description: string; code: number }> {
    console.log(
      '🔄 Réinitialisation du mot de passe avec les données auth.controller.ts :',
      dto,
    );

    const result = await this.auth.resetPassword(dto);
    console.log(
      '🔄 Réinitialisation du mot de passe result auth.controller.ts :',
      result,
    );

    if (result.code !== 201) {
      throw new HttpException(
        {
          title: result.title,
          description: result.description,
          code: result.code,
        },
        result.code,
      );
    }

    return {
      title: result.title,
      description: result.description,
      code: result.code,
    };
  }

  @Get('login-history')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllLoginHistory(@CurrentUser() user: JwtPayload) {
    return this.auth.getAllLoginHistory(user);
  }
}
