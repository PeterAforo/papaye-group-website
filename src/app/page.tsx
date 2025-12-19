import { HeroBanner } from "@/components/sections/hero-banner";
import { MenuPreview } from "@/components/sections/menu-preview";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { BranchesSection } from "@/components/sections/branches-section";
import { TestimonialsSlider } from "@/components/sections/testimonials-slider";
import { CTASection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <MenuPreview />
      <WhyChooseUs />
      <BranchesSection />
      <TestimonialsSlider />
      <CTASection />
    </>
  );
}
