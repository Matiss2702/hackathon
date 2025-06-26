/* eslint-disable @typescript-eslint/no-unsafe-assignment,
                  @typescript-eslint/no-unsafe-call,
                  @typescript-eslint/no-unsafe-member-access,
                  @typescript-eslint/no-unsafe-return,
                  @typescript-eslint/no-unsafe-argument */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { EmailService } from '../email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const SALT_ROUNDS = 12;
const EMAIL_VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY = 5 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /* ----------  REGISTER  ---------- */
  async register(dto: RegisterDto) {
    try {
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
      });
      if (exists) {
        throw new ConflictException('Email déjà utilisé');
      }
      const hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(
        Date.now() + EMAIL_VERIFICATION_EXPIRY,
      );

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstname: dto.firstname,
          lastname: dto.lastname,
          phone_number: dto.phoneNumber,
          is_cgu_accepted: dto.isCguAccepted,
          companyName: dto.companyName || '',
          is_vgcl_accepted: dto.isVgclAccepted,
          email_verification_token: verificationToken,
          email_verification_token_expires: verificationTokenExpires,
          role: 'user',
        },
        select: { id: true, email: true, firstname: true },
      });

      await this.prisma.passwordHistory.create({
        data: {
          password: hash,
          user_id: user.id,
        },
      });
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );

      return { id: user.id, email: user.email };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /* ----------  LOGIN  ---------- */
  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          passwordHistory: { orderBy: { created_at: 'desc' }, take: 1 },
        },
      });

      if (!user) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      if (!user.is_email_verified) {
        throw new UnauthorizedException(
          'Veuillez vérifier votre email avant de vous connecter',
        );
      }

      const ok = await bcrypt.compare(
        dto.password,
        user.passwordHistory[0].password,
      );
      if (!ok) {
        throw new UnauthorizedException('Identifiants invalides');
      }

      await this.prisma.loginHistory.create({ data: { user_id: user.id } });

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        id: user.id,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwt.signAsync(payload, {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: '1h',
        }),
        this.jwt.signAsync(payload, {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        }),
      ]);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /* ----------  VERIFY EMAIL  ---------- */
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email_verification_token: token,
        email_verification_token_expires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Token invalide ou expiré');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        is_email_verified: true,
        email_verification_token: null,
        email_verification_token_expires: null,
      },
    });

    return { message: 'Email vérifié avec succès' };
  }

  /* ----------  REFRESH TOKEN  ---------- */
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) throw new UnauthorizedException();

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        id: user.id,
      };

      return {
        access_token: await this.jwt.signAsync(newPayload, {
          secret: this.config.get('JWT_SECRET'),
          expiresIn: '1h',
        }),
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  /* ----------  FORGOT PASSWORD  ---------- */
  async newForgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return {
        code: 202,
        title: 'Réinitialisation de mot de passe',
        description:
          "Un lien de réinitialisation a été envoyé.\nSuivez les instructions dans l'email pour changer votre mot de passe.",
      };
    }
    const expiredAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY);
    const rawToken = `id_${user.id}-email_${user.email}-cre_${Date.now()}-exp_${expiredAt.getTime()}`;

    const token = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('base64url');

    const resetRequest = await this.prisma.forgotPassword.create({
      data: {
        email: user.email,
        token,
        expiredAt,
      },
    });

    if (!resetRequest) {
      return {
        code: 500,
        title: 'Erreur - Réinitialisation de mot de passe',
        description:
          'Une erreur est survenue!\nVeuillez réessayer plus tard ou contacter un administrateur.',
      };
    }

    try {
      await this.emailService.sendNewForgotPasswordEmail(user.email, token);
      await this.prisma.forgotPassword.update({
        where: { id: resetRequest.id },
        data: { sentAt: new Date() },
      });
    } catch {
      return {
        code: 500,
        title: 'Erreur - Réinitialisation de mot de passe',
        description:
          'Une erreur est survenue!\nVeuillez réessayer plus tard ou contacter un administrateur.',
      };
    }

    return {
      code: 200,
      title: 'Demande de réinitialisation de mot de passe',
      description:
        "Un lien de réinitialisation a été envoyé.\nSuivez les instructions dans l'email pour changer votre mot de passe.",
    };
  }

  async validateResetToken(token: string): Promise<{
    code: number;
    title: string;
    description: string;
  }> {
    if (!token) {
      return {
        code: 404,
        title: 'Lien invalide',
        description: 'Unkown token.',
      };
    }

    const record = await this.prisma.forgotPassword.findUnique({
      where: { token },
      select: {
        email: true,
        expiredAt: true,
        editedAt: true,
        token: true,
      },
    });

    if (!record) {
      return {
        code: 404,
        title: 'Lien invalide',
        description: 'Ce lien de réinitialisation est invalide.',
      };
    }

    if (token !== record.token) {
      return {
        code: 401,
        title: 'Token invalide',
        description: 'Ce Token de réinitialisation est invalide.',
      };
    }

    if (record.expiredAt <= new Date()) {
      return {
        code: 401,
        title: 'Lien expiré',
        description:
          'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
      };
    }

    if (record.editedAt) {
      return {
        code: 401,
        title: 'Lien déjà utilisé',
        description:
          'Ce lien a déjà été utilisé pour réinitialiser le mot de passe.',
      };
    }

    return {
      code: 200,
      title: 'Lien valide',
      description: 'Le lien de réinitialisation est valide.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{
    code: number;
    title: string;
    description: string;
  }> {
    console.log(
      '🔄 Réinitialisation du mot de passe avec les données auth.service.ts :',
      dto,
    );

    if (!dto) {
      return {
        code: 404,
        title: 'Lien invalide',
        description: 'Paramètres invalides.',
      };
    }

    if (
      !dto.token ||
      !dto.oldPassword ||
      !dto.newPassword ||
      !dto.confirmPassword
    ) {
      return {
        code: 400,
        title: 'Paramètres manquants',
        description: 'Paramètres invalides.',
      };
    }

    if (
      dto.oldPassword === dto.newPassword ||
      dto.oldPassword === dto.confirmPassword
    ) {
      return {
        code: 400,
        title: 'Mots de passe identiques',
        description: "L'ancien mot de passe et le nouveau sont identiques.",
      };
    }

    if (dto.newPassword !== dto.confirmPassword) {
      return {
        code: 400,
        title: 'Mots de passe non concordants',
        description:
          'Le nouveau mot de passe et la confirmation ne correspondent pas.',
      };
    }

    const forgotPassword = await this.prisma.forgotPassword.findUnique({
      where: { token: dto.token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            passwordHistory: { orderBy: { created_at: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!forgotPassword || !forgotPassword.user) {
      return {
        code: 404,
        title: 'Utilisateur non trouvé',
        description:
          'Aucun utilisateur trouvé pour ce lien de réinitialisation.',
      };
    }

    const lastPassword = forgotPassword.user.passwordHistory[0]?.password;
    if (!lastPassword) {
      return {
        code: 404,
        title: 'Aucun mot de passe trouvé',
        description: 'Aucun mot de passe trouvé pour cet utilisateur.',
      };
    }

    const samePassword = await bcrypt.compare(dto.oldPassword, lastPassword);
    if (!samePassword) {
      return {
        code: 409,
        title: 'Mot de passe incorrect',
        description: "L'ancien mot de passe est incorrect.",
      };
    }

    if (dto.token !== forgotPassword.token) {
      return {
        code: 401,
        title: 'Token invalide',
        description: 'Ce Token de réinitialisation est invalide.',
      };
    }

    if (forgotPassword.expiredAt <= new Date()) {
      return {
        code: 401,
        title: 'Lien expiré',
        description: 'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
      };
    }

    if (forgotPassword.editedAt) {
      return {
        code: 401,
        title: 'Lien déjà utilisé',
        description:
          'Ce lien a déjà été utilisé pour réinitialiser le mot de passe.',
      };
    }

    const hash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.passwordHistory.create({
      data: {
        password: hash,
        user_id: forgotPassword.user.id,
      },
    });
    await this.prisma.user.update({
      where: { email: forgotPassword.user.email },
      data: { updated_at: new Date() },
    });

    await this.prisma.forgotPassword.update({
      where: { token: dto.token },
      data: { editedAt: new Date() },
    });

    try {
      await this.emailService.sendResetPasswordEmail(forgotPassword.user.email);
    } catch (error) {
      console.error(
        '❌ Erreur lors de l\'envoi de l\'email de "Mot de passe réinitialisé" :',
        error,
      );
    }

    return {
      code: 200,
      title: 'Mot de passe réinitialisé',
      description:
        'Vous pouvez dès à présent vous reconnecter avec votre nouveau mot de passe.',
    };
  }

  /* ----------  GET ALL LOGIN HISTORY  ---------- */
  async getAllLoginHistory(user: JwtPayload) {
    if (!user) {
      throw new UnauthorizedException();
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });
    if (!dbUser) throw new UnauthorizedException();
    if (dbUser.role === 'admin') {
      return this.prisma.loginHistory.findMany({ orderBy: { date: 'desc' } });
    }
    return this.prisma.loginHistory.findMany({
      where: { user_id: user.sub },
      orderBy: { date: 'desc' },
    });
  }
}
