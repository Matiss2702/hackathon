'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, type RegisterFormData } from '@/app/schemas/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputPassword } from '@/components/ui/input-password';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/lib/axios';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import LoginWithBrands from '@/components/login-with-brands';
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      firstname: '',
      lastname: '',
      phone_number: '',
      password: '',
      confirmPassword: '',
      is_cgu_accepted: false,
      is_vgcl_accepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/auth/register', {
        email: data.email,
        firstname: data.firstname,
        lastname: data.lastname,
        phone_number: data.phone_number || undefined,
        password: data.password,
        is_cgu_accepted: data.is_cgu_accepted,
        is_vgcl_accepted: data.is_vgcl_accepted,
      });
      toast("Inscription réussie !")
      router.push('/login');
    } catch (error: any) {
      form.setError('root', {
        message:
          error.response?.data?.message ||
          "Une erreur est survenue lors de l'inscription",
      });
    }
  };

  return (
    <div className='container grid grid-cols-1 gap-4 lg:gap-8'>
      <h1 className='text-center font-bold text-2xl lg:text-5xl'>S&apos;inscrire</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="exemple@email.com"
                    autoComplete="on"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prénom */}
          <FormField
            control={form.control}
            name="firstname"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nom */}
          <FormField
            control={form.control}
            name="lastname"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Téléphone (optionnel) */}
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel>Téléphone (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Votre numéro de téléphone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mot de passe */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel htmlFor='password'>Mot de passe</FormLabel>
                <FormControl>
                  <InputPassword
                    id="password"
                    placeholder="Votre mot de passe"
                    autoComplete='on'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirmer le mot de passe */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className='grid gap-2'>
                <FormLabel htmlFor='confirmPassword'>Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <InputPassword
                    id="confirmPassword"
                    placeholder="Confirmez votre mot de passe"
                    autoComplete='on'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CGU */}
          <FormField
            control={form.control}
            name="is_cgu_accepted"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3">
                <FormControl>
                  <Checkbox
                    id="cgu"
                    checked={field.value}
                    name="is_cgu_accepted"
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                    }}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="cgu" className="cursor-pointer">
                    J&apos;accepte les conditions générales d&apos;utilisation
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          {/* VGCL */}
          <FormField
            control={form.control}
            name="is_vgcl_accepted"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3">
                <FormControl>
                  <Checkbox
                    id="vgcl"
                    name="is_vgcl_accepted"
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                    }}
                  />
                </FormControl>
                  <FormLabel htmlFor="vgcl" className="cursor-pointer leading-none">
                    J&apos;accepte les conditions de vie et de confidentialité
                  </FormLabel>
              </FormItem>
            )}
          />

          {/* Erreur globale */}
          {form.formState.errors.root && (
            <div className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </div>
          )}

          <Button type="submit" className="w-full">
            S&apos;inscrire
          </Button>
        </form>
      </Form>
      <div className='flex items-center w-full mt-2 mb-2 lg:mt-4 lg:mb-4'>
        <Separator className='flex-1'/>
        <span className="px-4 text-sm text-muted-foreground">Ou s&apos;inscrire avec</span>
        <Separator className='flex-1' />
      </div>
      <LoginWithBrands title="S'inscrire"/>
      <div className='flex items-center justify-center gap-2'>
          <span>Déjà un compte ?</span>
          <Link href="/login" className='hover:underline focus:underline'>
            <span><strong>Je me connecte</strong></span>
          </Link>
      </div>
    </div>
  );
}
