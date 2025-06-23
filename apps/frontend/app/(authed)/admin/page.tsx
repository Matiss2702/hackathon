import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
};

export default function Admin() {
  return (
    <>
      <h1 className="text-2xl font-bold">Administration</h1>
      <p className="mt-4">Cette page est en cours de développement.</p>
      <p>Merci de votre patience !</p>
    </>
  )
}