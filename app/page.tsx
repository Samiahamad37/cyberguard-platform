import { LandingNavbar } from "@/components/layout/navbar";
import { FloatingTechIcons } from "@/components/shared/floating-tech-icons";
import { SiteBackground } from "@/components/shared/site-background";
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
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <SiteBackground className="fixed inset-0" />
      <FloatingTechIcons className="fixed inset-0" />
      <LandingNavbar />
      <main className="relative z-10">
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
