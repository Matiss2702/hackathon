"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  AgentUpdateSchema,
  AgentUpdateFormData,
} from "@/app/schemas/agentia";

import api from "@/lib/axios";
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

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AgentUpdateFormData>({
    resolver: zodResolver(AgentUpdateSchema),
    defaultValues: {
      name: "",
      description: "",
      skills: [],
      url: "",
      isVisible: false,
    },
  });

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await api.get(`/agentia/${agentId}`);
        const agent = response.data;

        form.reset({
          ...agent,
          skills: agent.skills ?? [],
        });
      } catch (error) {
        toast.error("Erreur lors du chargement de l'agent.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (agentId) fetchAgent();
  }, [agentId, form]);

  const onSubmit = async (data: AgentUpdateFormData) => {
    setSubmitting(true);
    try {
      await api.put(`/agentia/${agentId}`, data);
      toast.success("Agent mis à jour avec succès !", {
        position: "top-center",
        description: "Vous allez être redirigé vers la liste des agents.",
      });
      router.push("/agents-ia");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour.", {
        position: "top-center",
      });
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

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

      <h1 className="text-2xl font-bold">Modifier l&apos;agent</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ID */}
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID</FormLabel>
                <FormControl>
                  <Input placeholder="ID de l'agent" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* isVisible */}
          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                <FormLabel>Visible publiquement</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Nom */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Skills */}
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compétences (séparées par des virgules)</FormLabel>
                <FormControl>
                  <Input
                    defaultValue={field.value.join(", ")}
                    onChange={(e) => {
                      const parsed = e.target.value
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
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
