import { LandingNavbar } from "@/components/layout/navbar";
import { HeroSection } from "@/features/landing/hero";
import {
  BenefitsSection,
  FAQSection,
  FeaturesSection,
  FooterSection,
  PricingSection,
  TestimonialsSection,
} from "@/features/landing/sections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <FooterSection />
    </div>
  );
}
