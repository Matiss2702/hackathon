'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/app/schemas/auth';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
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
import { InputPassword } from '@/components/ui/input-password';
import { Separator } from '@/components/ui/separator';
import LoginWithBrands from '@/components/login-with-brands';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { z } from 'zod';

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    try {
      const response = await api.post('/auth/login', data);
      // on récupère bien access_token
      const accessToken = response.data.access_token;
      if (!accessToken) {
        throw new Error('Token manquant dans la réponse');
      }
      login(accessToken);
      toast.success('Connexion réussie !', {
        position: 'top-center',
        duration: 3000,
      });
      router.push('/profile');
    } catch (err: any) {
      console.error('❌ Erreur connexion', err);
      let message = 'Une erreur est survenue';
      const status = err?.response?.status;
      if (status === 401) message = "Email ou mot de passe incorrect";
      else if (status === 500) message = "Erreur serveur (500)";
      else if (err.message) message = err.message;
      form.setError('root', { message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container grid grid-cols-1 gap-4 lg:gap-8">
      <h1 className="text-center font-bold text-2xl lg:text-5xl">Se connecter</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <div className="flex items-center justify-between">
                  <FormLabel htmlFor="password">Mot de passe</FormLabel>
                  <Link href="/forgot-password">
                    <span className="text-sm font-bold hover:underline">
                      Mot de passe oublié ?
                    </span>
                  </Link>
                </div>
                <FormControl>
                  <InputPassword
                    id="password"
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
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
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </Button>
        </form>
      </Form>

      <div className="flex items-center w-full my-4">
        <Separator className="flex-1" />
        <span className="px-4 text-sm text-muted-foreground">
          Ou se connecter avec
        </span>
        <Separator className="flex-1" />
      </div>

      <LoginWithBrands title="Se connecter" />

      <div className="flex items-center justify-center gap-2">
        <span>Pas encore de compte ?</span>
        <Link href="/register" className="hover:underline">
          <strong>Je m’inscris</strong>
        </Link>
      </div>
    </div>
  );
}
