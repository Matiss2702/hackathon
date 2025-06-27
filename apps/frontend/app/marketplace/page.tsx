'use client';

import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { useCurrentUser } from "@/lib/useCurrentUser";

interface Agent {
  id: string;
  name: string;
  description: string;
  url: string;
  skills?: string[];
  user?: {
    firstname: string;
    lastname: string;
  };
  organization: {
    name: string;
  };
}

interface Subscription {
  id: string;
  tarification: {
    id: string;
    name: string;
    price: number;
    token: number;
    description: string[];
    planType: 'monthly' | 'annually' | 'free';
  };
  created_at: Date;
  end_at: Date;
}

export default function AgentsIAPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: userLoading } = useCurrentUser();

  useEffect(() => {
    axios.get('/agentia/public')
      .then(res => setAgents(res.data))
      .catch(() => setError('Erreur lors du chargement des agents IA.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get(`/subscription`);
        if (response.status === 200) {
          setSubscriptions(response.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des souscriptions", err);
      }
    };

    if (user) fetchSubscriptions();
  }, [user]);

  const getAccessUrl = (baseUrl: string): string => {
    if (!user) return `${baseUrl}/3`;
    if (subscriptions.length === 0) return `${baseUrl}/2`;

    const plan = subscriptions[0]?.tarification?.planType;
    switch (plan) {
      case 'monthly':
        return `${baseUrl}/12`;
      case 'annually':
        return `${baseUrl}/13`;
      case 'free':
        return `${baseUrl}/11`;
      default:
        return `${baseUrl}/2`;
    }
  };

  if (loading || userLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <section className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Marketplace des agents IA</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((a) => (
          <Card key={a.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">{a.name}</CardTitle>
              <CardDescription>{a.description}</CardDescription>
              {a.user && (
                <div className="text-muted-foreground text-xs">
                  Prestataire : {a.user.firstname} {a.user.lastname}
                </div>
              )}
            </CardHeader>
            <CardContent className='grid grid-cols-1 gap-4'>
              <div>
                <h2 className='text-2xl font-bold'>Proposé par :</h2>
                <p>{a.organization.name}</p>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className='text-2xl font-bold'>Spécialités :</h2>
                <div className='flex flex-wrap gap-1'>
                  {a.skills?.map((skill: string) => (
                    <Badge key={skill}>{skill}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link
                  href={getAccessUrl(a.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Accéder à l&apos;agent IA
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}
