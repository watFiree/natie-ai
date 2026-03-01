import './home.css';
import {
  Navbar,
  Hero,
  Features,
  ChatDemo,
  Integrations,
  WorkflowDemo,
  OpenSource,
  Footer,
  AnimatedGradient,
} from '@/components/home';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <AnimatedGradient />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <ChatDemo />
        <Integrations />
        <WorkflowDemo />
        <OpenSource />
        <Footer />
      </div>
    </main>
  );
}
