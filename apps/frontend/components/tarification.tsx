"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GetTarifications from "@/components/get-tarifications";

export default function Tarification() {
const plans = [
    {
      name: "Mensuelle",
      value: "monthly" as const,
    },
    {
      name: "Annuelle",
      value: "annually" as const,
    }
  ]

  return (
    <section className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Tarifications</h1>
      <Tabs defaultValue={plans[0].value}>
        <TabsList className="mx-auto">
          {plans.map((plan) => (
            <TabsTrigger key={plan.value} value={plan.value}>
              {plan.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {plans.map((plan) => (
          <TabsContent key={plan.value} value={plan.value}>
            <GetTarifications name={plan.value} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}