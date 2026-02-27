import type { JSX } from "react";
import Hero from "../components/Hero.tsx";
import Features from "../components/Features.tsx";
import HowItWorks from "../components/HowItWorks.tsx";
import Pricing from "../components/Pricing.tsx";
import Contact from "../components/Contact.tsx";
export default function Landing(): JSX.Element {
  return (
    <div>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Contact />
    </div>
    
  );
}
