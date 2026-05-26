import { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LandingPage from "./components/LandingPage";

export const metadata: Metadata = {
  title: "QuantumTrade - Algorithmic Trading Platform",
  description:
    "Self-Optimizing Algorithmic Trading Platform with NinjaTrader 8 Integration",
};

export default async function Home() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("quantum_auth");

  if (authToken) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
