"use client";

import { Building } from "lucide-react";

export default function PageAgentsPartners() {
  return (
    <section className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Building/><span>Nos partenaires</span></h1>
        </div>
      </div>
    </section>
  );
}