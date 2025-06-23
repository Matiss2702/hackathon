// app/verify-email/page.tsx
'use client';

import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
        const params = useSearchParams();
        const router = useRouter();
        const token = params.get('token');
        const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
        const [message, setMessage] = useState<string>('');

        useEffect(() => {
                if (!token) {
                        setStatus('error');
                        setMessage('Token manquant dans l’URL.');
                        return;
                }

                async function verify() {
                        try {
                                const res = await fetch(
                                        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
                                        { method: 'GET' }
                                );
                                const body = await res.json();
                                if (res.ok) {
                                        setStatus('success');
                                        setMessage('Votre email a bien été vérifié ! Redirection…');
                                        setTimeout(() => router.push('/login'), 3000);
                                } else {
                                        throw new Error(body.message || 'Erreur inconnue');
                                }
                        } catch (err: any) {
                                setStatus('error');
                                setMessage(err.message || 'Impossible de vérifier votre email.');
                        }
                }

                verify();
        }, [token, router]);

        return (
                <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="max-w-md text-center space-y-4">
                                {status === 'loading' && <p>Vérification en cours…</p>}
                                {status === 'success' && <p className="text-green-600">{message} <Link href="/login">Se connecter</Link></p>}
                                {status === 'error' && <p className="text-red-600">{message}</p>}
                        </div>
                </div>
        );
}
