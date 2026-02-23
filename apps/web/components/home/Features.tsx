'use client';

import {
  CheckCircle,
  Newspaper,
  Mail,
  Calendar,
  Lock,
  Zap,
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: CheckCircle,
    title: 'Todo Management',
    description:
      'Automatically organize and prioritize your tasks. Get smart reminders and daily summaries of what needs your attention.',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
  },
  {
    icon: Newspaper,
    title: 'Daily News Digest',
    description:
      'Get a personalized news briefing every morning. Curated from your favorite sources, summarized by AI.',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  {
    icon: Mail,
    title: 'Email Assistant',
    description:
      'Summarize long threads, draft quick replies, and never miss important messages. Your inbox, tamed.',
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description:
      'Manage your calendar effortlessly. Get daily briefings, meeting prep, and reminders for what matters.',
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
  },
  {
    icon: Zap,
    title: 'Ready-Made Workflows',
    description:
      'Pre-configured automations that just work. Connect your apps once, let Natie handle the rest.',
    gradient: 'bg-gradient-to-br from-rose-500 to-pink-500',
  },
  {
    icon: Lock,
    title: 'Your Data, Yours',
    description:
      'Self-host for complete privacy or use our secure cloud. Your personal data never leaves your control.',
    gradient: 'bg-gradient-to-br from-indigo-500 to-blue-500',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Automate Your Daily Life
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pre-built automations for the things you do every day. Set it up
            once, enjoy the productivity boost forever.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
