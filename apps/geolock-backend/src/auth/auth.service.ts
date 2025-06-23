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
  ForbiddenException,
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
    console.log("\n🚀 Début du processus d'inscription...");
    console.log(`📧 Email: ${dto.email}`);
    console.log(`👤 Nom: ${dto.lastname} ${dto.firstname}`);

    try {
      console.log("\n🔍 Vérification de l'existence de l'utilisateur...");
      const exists = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
      });
      if (exists) {
        console.log('❌ Email déjà utilisé');
        throw new ConflictException('Email déjà utilisé');
      }
      console.log('✅ Email disponible');

      console.log('\n🔒 Hachage du mot de passe...');
      const hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
      console.log('✅ Mot de passe haché');

      console.log('\n🔑 Génération du token de vérification...');
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(
        Date.now() + EMAIL_VERIFICATION_EXPIRY,
      );
      console.log('✅ Token généré');

      console.log("\n📝 Création de l'utilisateur...");
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstname: dto.firstname,
          lastname: dto.lastname,
          phone_number: dto.phone_number,
          is_cgu_accepted: dto.is_cgu_accepted,
          is_vgcl_accepted: dto.is_vgcl_accepted,
          passwordHistory: { create: { password: hash } },
          email_verification_token: verificationToken,
          email_verification_token_expires: verificationTokenExpires,
        },
        select: { id: true, email: true, firstname: true },
      });
      console.log('✅ Utilisateur créé avec succès');

      console.log('\n📧 Envoi des emails...');
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );

      return { id: user.id, email: user.email };
    } catch (error) {
      console.error("\n❌ Erreur dans le processus d'inscription:");
      console.error(error);
      throw error;
    }
  }

  /* ----------  LOGIN  ---------- */
  async login(dto: LoginDto) {
    console.log('\n🚀 Début du processus de connexion...');
    console.log(`📧 Email: ${dto.email}`);

    try {
      console.log("\n🔍 Recherche de l'utilisateur...");
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          passwordHistory: { orderBy: { created_at: 'desc' }, take: 1 },
          roles: {
            select: { role: { select: { name: true, power: true, id: true } } },
          },
        },
      });

      if (!user) {
        console.log('❌ Utilisateur non trouvé');
        throw new UnauthorizedException('Identifiants invalides');
      }
      console.log('✅ Utilisateur trouvé');

      if (user.passwordHistory.length === 0) {
        console.log("❌ Aucun mot de passe trouvé dans l'historique");
        throw new UnauthorizedException('Identifiants invalides');
      }
      console.log('✅ Historique des mots de passe trouvé');

      if (!user.is_email_verified) {
        console.log('❌ Email non vérifié');
        throw new UnauthorizedException(
          'Veuillez vérifier votre email avant de vous connecter',
        );
      }
      console.log('✅ Email vérifié');

      console.log('\n🔒 Vérification du mot de passe...');
      const ok = await bcrypt.compare(
        dto.password,
        user.passwordHistory[0].password,
      );
      if (!ok) {
        console.log('❌ Mot de passe incorrect');
        throw new UnauthorizedException('Identifiants invalides');
      }
      console.log('✅ Mot de passe correct');

      console.log("\n📝 Création de l'historique de connexion...");
      await this.prisma.loginHistory.create({ data: { user_id: user.id } });
      console.log('✅ Historique de connexion créé');

      console.log('\n🔑 Génération des tokens...');
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles:
          user.roles.length > 0
            ? user.roles.map((r) => ({
                id: r.role.id,
                name: r.role.name,
                power: r.role.power,
              }))
            : [{ name: 'USER', power: 10, id: 'default-role-id' }],
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
      console.log('✅ Tokens générés avec succès');

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error('\n❌ Erreur dans le processus de connexion:');
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
        include: {
          roles: {
            select: { role: { select: { name: true, power: true, id: true } } },
          },
        },
      });

      if (!user) throw new UnauthorizedException();

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        roles:
          user.roles.length > 0
            ? user.roles.map((r) => ({
                id: r.role.id,
                name: r.role.name,
                power: r.role.power,
              }))
            : [{ name: 'USER', power: 10, id: 'default-role-id' }],
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
            passwordHistory: {
              orderBy: { created_at: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!forgotPassword) {
      return {
        code: 404,
        title: 'Lien invalide',
        description: 'Ce lien de réinitialisation est invalide.',
      };
    }

    if (!forgotPassword.user) {
      return {
        code: 404,
        title: 'Utilisateur non trouvé',
        description:
          'Aucun utilisateur trouvé pour ce lien de réinitialisation.',
      };
    }

    if (forgotPassword.user.passwordHistory.length === 0) {
      return {
        code: 404,
        title: 'Historique de mot de passe vide',
        description: 'Aucun mot de passe trouvé pour cet utilisateur.',
      };
    }

    if (forgotPassword.user.passwordHistory[0].password === dto.oldPassword) {
      return {
        code: 409,
        title: 'Mot de passe identique',
        description: "Le nouveau mot de passe doit être différent de l'ancien.",
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
        description:
          'Ce lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
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
    await this.prisma.user.update({
      where: { email: forgotPassword.user.email },
      data: {
        passwordHistory: {
          create: { password: hash },
        },
        updated_at: new Date(),
      },
    });

    await this.prisma.forgotPassword.update({
      where: { token: dto.token },
      data: { editedAt: new Date() },
    });

    try {
      await this.emailService.sendResetPasswordEmail(forgotPassword.user.email);
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'envoi de l'email de \"Mot de passe réinitialisé\" :",
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

    const userRole = await this.prisma.userRole.findFirst({
      where: { user_id: user.sub },
      include: { role: true },
    });
    if (!userRole) throw new ForbiddenException();

    const power = userRole.role.power;

    if (power >= 100) {
      // Admin: voit tout
      return this.prisma.loginHistory.findMany({
        orderBy: { date: 'desc' },
      });
    }

    // Utilisateur normal ou modérateur: ne voit que son historique
    return this.prisma.loginHistory.findMany({
      where: { user_id: user.sub },
      orderBy: { date: 'desc' },
    });
  }
}
