"use client";

import api from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { resetPasswordSchema } from "@/app/schemas/auth";
import { InputPassword } from "@/components/ui/input-password";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type ResponseType = { code: number; title: string; description: string } | null;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<ResponseType>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const params = useSearchParams();
  const token = params.get("token");

  if (!token) {
    router.push('/404')
  }

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { 
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      token : token ?? '',
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get('/auth/forgot-password', {
          params: { token },
        });

        if (response.data.code === 200) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }

        setResponse(response.data);
      } catch (error) {
        console.error('❌ Token invalide', error);
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  if (tokenValid === false) {
    router.push('/404')
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setSubmitting(true);
    try {
      console.log("data", data);

      const response = await api.put('/auth/forgot-password', data);
      console.log("response", response);
    } catch (error) {
      console.log("❌ Erreur lors de la réinitialisation du mot de passe", error);
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    }
  }

  return (
    <div className='container grid grid-cols-1 gap-4 lg:gap-8'>
      { response && (
        <Alert variant={[200, 201, 202].includes(response.code) ? 'success' : 'destructive'}>
          <TriangleAlert />
          <AlertTitle>{response.title}</AlertTitle>
          <AlertDescription className='whitespace-pre-line'>
            {response.description}
          </AlertDescription>
        </Alert>
        )
      }
      <h1 className='text-center font-bold text-xl lg:text-3xl'>Réinitiliser son mot de passe</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel htmlFor="old-password">Ancien mot de passe</FormLabel>
                </div>
                <FormControl>
                  <InputPassword
                    id="old-password"
                    placeholder="Votre ancien mot de passe"
                    autoComplete="old-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel htmlFor="new-password">Nouveau mot de passe</FormLabel>
                </div>
                <FormControl>
                  <InputPassword
                    id="new-password"
                    placeholder="Votre nouveau mot de passe"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel htmlFor="confirm-password">Confirmer le mot de passe</FormLabel>
                </div>
                <FormControl>
                  <InputPassword
                    id="confirm-password"
                    placeholder="Confirmez votre nouveau mot de passe"
                    autoComplete="confirm-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="hidden"
                    id="token"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </div>
          )}

          {
            submitting ? (
              <Button type="submit" className="w-full" disabled>
                <svg className="mr-3 -ml-1 size-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">*
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Envoi en cours
              </Button>
            ) : (
              <Button type="submit" className="w-full">
                Changer mon mot de passe
              </Button>
            )
          }
        </form>
      </Form>
    </div>
  )
}