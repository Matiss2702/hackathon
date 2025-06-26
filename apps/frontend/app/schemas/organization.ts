import { z } from "zod";

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1, "Le nom de l'organisation est requis"),
  siret: z.string().min(1, "Le SIRET de l'organisation est requis"),
  siren: z.string().min(1, "Au moins un SIREN est requis"),
  rib: z.string().min(1,"Le RIB doit être valide"),
  vat: z.string().min(1, "Le numéro de TVA INTRACOMMUNAUTAIR doit être valide"),
});

export const OrganizationUpdateSchema = z.object({
  name: z.string().min(1, "Le nom de l'organisation est requis"),
  siret: z.string().min(1, "Le SIRET de l'organisation est requis"),
  siren: z.string().min(1, "Au moins un SIREN est requis"),
  rib: z.string().min(1,"Le RIB doit être valide"),
  vat: z.string().min(1, "Le numéro de TVA INTRACOMMUNAUTAIR doit être valide"),
  isDeleted: z.boolean().default(false),
});

export type OrganizationCreateFormData = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationUpdateFormData = z.infer<typeof OrganizationUpdateSchema>;