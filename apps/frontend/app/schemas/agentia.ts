import { z } from "zod";

export const AgentCreateSchema = z.object({
  name: z.string().min(1, "Le nom de l'agent est requis"),
  description: z.string().min(1, "La description de l'agent est requise"),
  skills: z.array(z.string()).min(1, "Au moins une compétence est requise"),
  url: z.string().url("L'URL doit être valide").optional(),
  isVisible: z.boolean().default(false),
});

export const AgentUpdateSchema = z.object({
  id: z.string().min(1, "L'ID de l'agent est requis"),
  name: z.string().min(1, "Le nom de l'agent est requis"),
  description: z.string().min(1, "La description de l'agent est requise"),
  skills: z.array(z.string()).min(1, "Au moins une compétence est requise"),
  url: z.string().url("L'URL doit être valide"),
  isVisible: z.boolean().default(false),
});

export type AgentCreateFormData = z.infer<typeof AgentCreateSchema>;
export type AgentUpdateFormData = z.infer<typeof AgentUpdateSchema>;