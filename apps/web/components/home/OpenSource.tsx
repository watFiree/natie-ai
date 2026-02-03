"use client";

import { Github, Code2 } from "lucide-react";

export function OpenSource() {
  return (
    <section id="open-source" className="py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl border border-border bg-gradient-to-br from-card to-background relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6">
              <Github className="w-8 h-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Open Source & Community Driven
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Natie AI is built in the open. Self-host for free, contribute to
              the project, or join our community of developers and users shaping
              the future of AI assistants.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/watFiree/natie-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-card/80 transition-colors"
              >
                <Github className="w-5 h-5" />
                Star on GitHub
              </a>
              <a
                href="https://docs.natie.ai/self-hosting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Code2 className="w-5 h-5" />
                Self-Host Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
