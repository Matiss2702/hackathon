"use client";

import Tarification from "@/components/tarification";

export default function Home() {
  return (
    <>
      <section className="max-w-7xl mx-auto p-4 pb-16">
        <h1 className="text-5xl font-bold mb-6">Bienvenue sur Noku</h1>
        <p className="mb-4">Trouvez l&apos;IA qui générera vos sites internets.</p>
      </section>
      <Tarification />
    </>
  )
}
