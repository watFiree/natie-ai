'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Code2, ArrowRight, Check } from 'lucide-react';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowScroll(entry.isIntersecting),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 backdrop-blur-sm mb-8 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Open Source & Self-Hostable
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span
            className="block text-foreground animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            Your Personal
          </span>
          <span
            className="block pb-2 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-500 bg-clip-text text-transparent animate-fade-in-up"
            style={{ animationDelay: '240ms' }}
          >
            Daily Assistant
          </span>
        </h1>

        <p
          className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '360ms' }}
        >
          Natie AI handles your daily routines automatically. Stay on top of
          your todos, catch up on news, manage emails, and more — all without
          lifting a finger.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '480ms' }}
        >
          <a
            href="/app"
            className="group flex items-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            Get Started
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
              Free
            </span>
          </a>
          <a
            href="https://docs.natie.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all"
          >
            <Code2 className="w-5 h-5" />
            Documentation
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Smart automations</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Privacy focused</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Open source</span>
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-500 ${showScroll ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </section>
  );
}
