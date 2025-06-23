import { isForbiddenSlug, isForbiddenTitle } from '@/lib/forbiddenPage';
import { z } from 'zod';

export const PageCreateSchema = z.object({
  title: z.string()
    .min(1, 'Le titre est requis')
      .refine(val => !isForbiddenTitle(val), {
        message: "Ce titre est interdit ou réservé.",
      }),
  slug: z.string()
    .min(1, 'Le slug est requis')
    .max(100, 'Le slug ne doit pas dépasser 100 caractères')
    .refine(val => !isForbiddenSlug(val), {
        message: "Ce slug est interdit ou réservé.",
      }),
  content: z
    .string()
    .min(1, 'Le contenu est requis'),
  description: z.string()
    .min(1, 'La description est requise')
    .max(160, 'La description ne doit pas dépasser 155 caractères'),
  is_active: z
    .boolean()
    .default(false),
  order: z
    .number()
    .default(0),
  menuId: z
    .string()
    .min(1, 'L\'ID du menu est requis'),
  parentId: z.string().nullable().optional().default(null),
});


export const PageUpdateSchema = z.object({
  id: z.string().min(1, 'L\'ID de la page est requis'),
  title: z.string()
    .min(1, 'Le titre est requis')
    .refine(val => !isForbiddenTitle(val), {
      message: "Ce titre est interdit ou réservé.",
    }),
  slug: z.string()
    .min(1, 'Le slug est requis')
    .max(100, 'Le slug ne doit pas dépasser 100 caractères')
   .refine(val => !isForbiddenSlug(val), {
      message: "Ce slug est interdit ou réservé.",
    }),
  content: z.string().min(1, 'Le contenu est requis'),
  description: z
    .string()
    .min(1, 'La description est requise')
    .max(160, 'La description ne doit pas dépasser 155 caractères'),
  is_active: z.boolean().default(false),
  order: z.number().default(0),
  menuId: z
    .string()
    .min(1, 'L\'ID du menu est requis'),
  parentId: z.string().nullable().optional().default(null),
});

export type PageCreateFormData = z.infer<typeof PageCreateSchema>;
export type PageUpdateFormData = z.infer<typeof PageUpdateSchema>;