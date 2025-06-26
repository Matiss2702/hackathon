"use client";

import { AgentCreateFormData,AgentCreateSchema } from "@/app/schemas/agentia";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AIAgentsNewPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [, setResponse] = useState<ResponseType | null>(null);

  const form = useForm<AgentCreateFormData>({
    resolver: zodResolver(AgentCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      skills: [],
      url: "",
      tarif_unique: 1,
      tarif_monthly: 0,
      tarif_annual: 0,
      isVisible: false,
    },
  });

  const onSubmit = async (data: AgentCreateFormData) => {
    setSubmitting(true);
    setResponse(null);

    try {
      const response = await api.post("/agentia", data);
      if (response.status === 201) {
        toast.success("Agent créé avec succès !", {
          position: "top-center",
          description: "Vous allez être redirigé vers la liste des agents.",
        });
        setResponse(response.data);
        router.push("/agents-ia");
      }
    } catch (error){
      console.error("Erreur lors de la création de l'agent :", error);
      setResponse(null)
    } finally {
      setSubmitting(false);
      setResponse(null)
    }
    form.reset();
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div>
        <Button asChild>
          <Link href="/agents-ia" className="flex items-center gap-2">
            <ArrowLeft />
            Retour
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Création d&apos;un nouvel agent</h1>
      </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Toggle visibilité */}
            <div>
              <FormField
                control={form.control}
                name="isVisible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-4 rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Visible publiquement</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            {/* Nom */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid girid-cols-1 gap-2">
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'agent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid girid-cols-1 gap-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Skills (transformer string -> array) */}
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem className="grid girid-cols-1 gap-2">
                  <FormLabel>Compétences (séparées par des virgules)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: React, TypeScript, Tailwind"
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsed = value
                          .split(",")
                          .map((s) => s.trim())
                          .filter((s) => s.length > 0);
                        field.onChange(parsed);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL */}
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="grid girid-cols-1 gap-2">
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tarifs */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tarif_unique"
                render={({ field }) => (
                  <FormItem className="grid girid-cols-1 gap-2">
                    <FormLabel>Tarif unique (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tarif_monthly"
                render={({ field }) => (
                  <FormItem className="grid girid-cols-1 gap-2">
                    <FormLabel>Tarif mensuel (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tarif_annual"
                render={({ field }) => (
                  <FormItem className="grid girid-cols-1 gap-2">
                    <FormLabel>Tarif annuel (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Création en cours..." : "Créer l'agent"}
            </Button>
          </form>
        </Form>
    </div>
  );
}
