"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
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
import { toast } from "sonner"

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // console.log("loginSchema", loginSchema)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);

    try {
      // Vérification que l'API est disponible
      const response = await api.post('/auth/login', data);
      const token = response.data?.access_token || response.data?.token;
      
      if (!token) {
        console.error('❌ Token manquant dans la réponse:', response.data);
        throw new Error('Token manquant dans la réponse du serveur');
      }

      // Login via le contexte (qui gère localStorage + cookies)
      login(token);

      // Redirection vers maps
      toast.success("Connexion réussie !", {
        position: 'top-center',
        duration: 3000
      })
      router.push('/maps');

    } catch (error: any) {
      console.error('❌ Erreur lors de la connexion:', error);
      console.error('📊 Détails de l\'erreur:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        config: error?.config?.url
      });
      
      let errorMessage = 'Une erreur est survenue';
      
      if (error?.response?.status === 500) {
        errorMessage = 'Erreur serveur (500). Vérifiez que l\'API est démarrée.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Service de connexion non trouvé';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      form.setError('root', { message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='container grid grid-cols-1 gap-4 lg:gap-8'>
      <h1 className='text-center font-bold text-2xl lg:text-5xl'>Se connecter</h1>
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <div className='flex items-center justify-between'>
                  <FormLabel htmlFor="password">Mot de passe</FormLabel>
                  <Link href="/forgot-password" className='text-sm font-bold hover:underline focus:underline'>
                    <span>Mot de passe oublié ?</span>
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
            {submitting ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </Form>
      <div className='flex items-center w-full mt-2 mb-2 lg:mt-4 lg:mb-4'>
        <Separator className='flex-1'/>
        <span className="px-4 text-sm text-muted-foreground">Ou se connecter avec</span>
        <Separator className='flex-1' />
      </div>
      <LoginWithBrands title="Se connecter"/>
      <div className='flex items-center justify-center gap-2'>
        <span>Pas encore de compte ?</span>
        <Link href="/register" className='hover:underline focus:underline'>
          <span><strong>Je m&apos;inscris</strong></span>
        </Link>
      </div>
    </div>
  );
}