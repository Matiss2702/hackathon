import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('Email invalide'),
    password: z
      .string()
      .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
      ),
    confirmPassword: z.string(),
    firstname: z.string().min(1, 'Le prénom est requis'),
    lastname: z.string().min(1, 'Le nom est requis'),
    phone_number: z.string().optional(),
    is_cgu_accepted: z.boolean().refine((val) => val === true, {
      message: 'Vous devez accepter les CGU',
    }),
    is_vgcl_accepted: z.boolean().refine((val) => val === true, {
      message: 'Vous devez accepter les VGCL',
    }),
    entity_id: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Format d'email invalide"),
});

export const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'L’ancien mot de passe doit contenir au moins 6 caractères'),
    newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string().min(6, 'La confirmation doit contenir au moins 6 caractères'),
    token: z.string().min(1, 'Le token est requis'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;