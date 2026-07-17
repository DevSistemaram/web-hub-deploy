import { Navbar } from '@/components/home/navbar';
import { Hero } from '@/components/home/hero';
import { Connections } from '@/components/home/connections';
import { Features } from '@/components/home/features';
import { HowItWorks } from '@/components/home/how-it-works';
import { Pricing } from '@/components/home/pricing';
import { FAQ } from '@/components/home/faq';
import { Footer } from '@/components/home/footer';

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Connections />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
