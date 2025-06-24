"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GetAgents, { ValidAgentsName } from "@/components/agents";
import { Bot } from "lucide-react";

export type AgentsTab = {
  name: string;
  value: ValidAgentsName;
};

const tabs: { name: string; value: ValidAgentsName }[] = [
  { name: "Agents IA", value: "ai-agents" },
  { name: "Prestataires", value: "companies" },
];

export default function AgentsPage() {
  return (
    <section className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bot /> Nos agents</h1>
        </div>
        <Tabs defaultValue={tabs[0].value} className="w-full">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <GetAgents name={tab.value} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}