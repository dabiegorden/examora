import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Audience } from "@/components/marketing/audience";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Security } from "@/components/marketing/security";
import { Comparison } from "@/components/marketing/comparison";
import { Testimonials } from "@/components/marketing/testimonials";
import { Faq } from "@/components/marketing/faq";
import { Cta } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";
import { StructuredData } from "@/components/marketing/structured-data";

export default function HomePage() {
  return (
    <>
      <StructuredData />

      <a
        href="#main"
        className="sr-only rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="flex-1">
        <Hero />
        <Audience />
        <Features />
        <HowItWorks />
        <Security />
        <Comparison />
        <Testimonials />
        <Faq />
        <Cta />
      </main>

      <Footer />
    </>
  );
}
