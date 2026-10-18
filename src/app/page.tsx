import { CalculatorSection } from "@/components/calculators/calculator-section";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollEffects } from "@/components/layout/scroll-effects";
import { AboutSection } from "@/components/sections/about-section";
import { AppSection } from "@/components/sections/app-section";
import { ContactSection } from "@/components/sections/contact-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { ServicesSection } from "@/components/sections/services-section";
import { organizationJsonLd } from "@/lib/site";

export default function Home() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }} />
            <Navbar />
            <main>
                <HeroSection />
                <ServicesSection />
                <HowItWorksSection />
                <AppSection />
                <CalculatorSection />
                <AboutSection />
                <FaqSection />
                <ContactSection />
            </main>
            <Footer />
            <ScrollEffects />
        </>
    );
}
