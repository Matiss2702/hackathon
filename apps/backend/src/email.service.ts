import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { join } from 'path';
import { readFileSync } from 'fs';
import { compile, TemplateDelegate } from 'handlebars';

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly templates: {
    verification: TemplateDelegate;
    forgotPassword: TemplateDelegate;
    resetPassword: TemplateDelegate;
  };

  constructor(private readonly config: ConfigService) {
    this.transporter = createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Précharge et compile les templates
    this.templates = {
      verification: this.compileTemplate('verification.hbs'),
      forgotPassword: this.compileTemplate('forgot-password.hbs'),
      resetPassword: this.compileTemplate('reset-password.hbs'),
    };

    // Vérification de la connexion SMTP
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Erreur de configuration SMTP:', error);
      } else {
        console.log('✅ Configuration SMTP valide');
      }
    });

    console.log("✅ Service d'email configuré");
  }

  /**
   * Charge et compile un template Handlebars depuis /src/templates/emails
   */
  private compileTemplate(templateName: string): TemplateDelegate {
    console.log(`📄 Chargement du template ${templateName}...`);
    const templatePath = join(
      process.cwd(),
      'src',
      'templates',
      'emails',
      templateName,
    );
    const content = readFileSync(templatePath, 'utf-8');
    console.log(`✅ Template ${templateName} chargé`);
    return compile(content);
  }

  /**
   * Envoie l'email de vérification
   */
  async sendVerificationEmail(email: string, token: string) {
    console.log(`\n📧 Envoi de l'email de vérification à ${email}...`);
    const verificationUrl = `${this.config.get<string>('FRONTEND_URL')}/verify-email?token=${token}`;
    const html = this.templates.verification({ verificationUrl });
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM'),
        to: email,
        subject: 'Vérification de votre email',
        html,
      });
      console.log('✅ Email de vérification envoyé !', info.messageId);
      return info;
    } catch (err: any) {
      console.error('❌ Erreur envoi email de vérification:', err);
      throw err;
    }
  }

  /**
   * Envoi un email générique (HTML) — utile pour le scheduler
   */
  async sendMail(to: string, subject: string, html: string) {
    const info = await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM'),
      to,
      subject,
      html,
    });
    return info;
  }

  async sendNewForgotPasswordEmail(email: string, token: string) {
    try {
      const resetPasswordUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
      const html = this.templates.forgotPassword({ resetPasswordUrl });

      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to: email,
        subject: 'Geolock - Réinitialisation de votre mot de passe',
        html,
      });
    } catch (error) {
      console.error(
        "❌ Erreur lors de l\'envoi de l\'email de réinitialisation:",
        error,
      );
      throw error;
    }
  }

  async sendResetPasswordEmail(email: string) {
    try {
      const forgotPasswordUrl = `${this.config.get('FRONTEND_URL')}/forgot-password`;
      const html = this.templates.resetPassword({ forgotPasswordUrl });

      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to: email,
        subject: 'Geolock - Mot de passe réinitialisé',
        html,
      });
    } catch (error) {
      console.error(
        '❌ Erreur lors de l\'envoi de l\'email de "Mot de passe réinitialisé" :',
      );
      console.error(error);
      throw error;
    }
  }
}
