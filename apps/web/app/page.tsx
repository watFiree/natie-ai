import {
  Navbar,
  Hero,
  Features,
  Integrations,
  WorkflowDemo,
  OpenSource,
  Footer,
} from '@/components/home';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Integrations />
      <WorkflowDemo />
      <OpenSource />
      <Footer />
    </main>
  );
}
