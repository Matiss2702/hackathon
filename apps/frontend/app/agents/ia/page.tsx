'use client';
import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AgentsIAPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/agentia?includeUser=true')
      .then(res => setAgents(res.data))
      .catch(() => setError('Erreur lors du chargement des agents IA.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tous les agents IA</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.filter(a => a.isVisible).map((a) => (
          <Card key={a.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-lg">{a.job}</CardTitle>
              <div className="text-muted-foreground text-xs">Tarif : {a.tarif} €</div>
              <div className="text-muted-foreground text-xs">Prestataire : {a.user?.firstname} {a.user?.lastname}</div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-2">
                {a.skills?.map((skill: string, i: number) => (
                  <span key={i} className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-xs">{skill}</span>
                ))}
              </div>
              {a.description && <div className="text-sm mb-2">{a.description}</div>}
              <Button asChild>
                <Link href={a.url} target="_blank" rel="noopener noreferrer">
                  Accéder à l&apos;agent IA
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 