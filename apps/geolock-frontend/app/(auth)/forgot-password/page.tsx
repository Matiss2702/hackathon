"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/app/schemas/auth';

import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

type ResponseType = { code: number; title: string; description: string } | null;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<ResponseType>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: ''},
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitting(true);
    setResponse(null);

    try {
      const response = await api.post('/auth/forgot-password', data);

      setResponse(response.data);
      setSubmitting(true);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as {
          message?: string;
          response?: {
            status?: number;
            data?: { message?: string };
          };
          config?: { url?: string };
        };

        console.error('📊 Détails de l\'erreur:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          config: err.config?.url
        });

        let errorMessage = 'Une erreur est survenue';

        if (err.response?.status === 500) {
          errorMessage = 'Erreur serveur (500). Vérifiez que l\'API est démarrée.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (err.response?.status === 404) {
          errorMessage = 'Service de connexion non trouvé';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        form.setError('root', { message: errorMessage });
      } else {
        form.setError('root', { message: 'Une erreur inattendue est survenue.' });
      }
    } finally {
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    }
  };

  return (
    <div className='container grid grid-cols-1 gap-4 lg:gap-8'>
      { response && (
        <Alert variant={[200, 202].includes(response.code) ? 'success' : 'destructive'}>
          <TriangleAlert />
          <AlertTitle>{response.title}</AlertTitle>
          <AlertDescription className='whitespace-pre-line'>
            {response.description}
          </AlertDescription>
        </Alert>
        )
      }
      <h1 className='text-center font-bold text-xl lg:text-3xl'>Mot de passe oublié</h1>
      <p>Entrez votre adresse e-mail pour recevoir un lien de réinitialisation de mot de passe.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    autoComplete="email"
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
      <div className="flex items-center justify-between">
        <Link href="/login" className='hover:underline focus:underline'>Se connecter</Link>
        <Link href="/register" className='hover:underline focus:underline'>S&apos;inscrire</Link>
      </div>
    </div>
  );
}