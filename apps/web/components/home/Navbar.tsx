"use client";

import Image from "next/image";
import { Github, ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 overflow-hidden rounded-lg">
              <Image
                src="/logo.png"
                alt="Natie AI"
                width={32}
                height={32}
                className="object-cover scale-150"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Natie AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#workflows"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Workflows
            </a>
            <a
              href="#open-source"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Open Source
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/watFiree/natie-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="/app"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
