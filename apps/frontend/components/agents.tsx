"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export type ValidAgentsName = "ai-agents" | "companies";

type getAgentsProps = {
  name: ValidAgentsName;
};

export default function GetAgents({ name }: getAgentsProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
        <CardDescription>Découvrez quel agent correspond le mieux à votre projet !</CardDescription>
      </CardHeader>
      <CardContent className="grow">
        {name === "ai-agents" && (
          <p>Liste des agents IA</p>
        )}

        {name === "companies" && (
          <p>Liste des prestataires</p>
        )}
      </CardContent>
    </Card>
  );
}
