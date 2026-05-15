import { Metadata } from "next";
import LandingPage from "./components/LandingPage";

export const metadata: Metadata = {
  title: "QuantumTrade - Algorithmic Trading Platform",
  description:
    "Self-Optimizing Algorithmic Trading Platform with NinjaTrader 8 Integration",
};

export default function Home() {
  return <LandingPage />;
}
