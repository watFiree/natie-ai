'use client';

import {
  CheckCircle,
  Newspaper,
  Mail,
  Calendar,
  Lock,
  Zap,
  Check,
  ArrowRight,
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';
import { ScrollReveal } from './ScrollReveal';

/* ── Mini demo: animated todo list ── */
function TodoDemo() {
  const items = [
    { text: 'Review PR #42', done: true },
    { text: 'Ship feature update', done: true },
    { text: 'Write docs for API', done: false },
    { text: 'Team standup notes', done: false },
  ];
  return (
    <div className="space-y-2 w-full">
      {items.map((item, i) => (
        <div
          key={item.text}
          className="flex items-center gap-2.5 text-xs px-3 py-2 rounded-lg bg-background/50 border border-border/50"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div
            className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-emerald-500/20' : 'border border-border'}`}
          >
            {item.done && <Check className="w-3 h-3 text-emerald-400" />}
          </div>
          <span
            className={
              item.done
                ? 'line-through text-muted-foreground/50'
                : 'text-foreground/80'
            }
          >
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Mini demo: news ticker ── */
function NewsDemo() {
  const headlines = [
    { tag: 'AI', text: 'GPT-5 sets new benchmarks in reasoning', time: '2h' },
    { tag: 'Tech', text: 'React 20 introduces async components', time: '4h' },
    { tag: 'Dev', text: 'Rust overtakes C++ in systems dev', time: '6h' },
  ];
  return (
    <div className="space-y-2 w-full">
      {headlines.map((h, i) => (
        <div
          key={h.text}
          className="flex items-start gap-3 text-xs px-3 py-2 rounded-lg bg-background/50 border border-border/50 group/item hover:border-blue-500/30 transition-colors"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium flex-shrink-0">
            {h.tag}
          </span>
          <span className="text-foreground/80 flex-1 truncate">{h.text}</span>
          <span className="text-muted-foreground/50 flex-shrink-0">
            {h.time}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Mini demo: email preview ── */
function EmailDemo() {
  const emails = [
    {
      from: 'Sarah',
      avatar: 'S',
      subject: 'Team sync tomorrow at 3pm',
      color: 'bg-violet-500',
      unread: true,
    },
    {
      from: 'AWS',
      avatar: 'A',
      subject: 'Your monthly bill is ready',
      color: 'bg-amber-500',
      unread: true,
    },
    {
      from: 'James',
      avatar: 'J',
      subject: 'PR review requested',
      color: 'bg-emerald-500',
      unread: false,
    },
  ];
  return (
    <div className="space-y-2 w-full">
      {emails.map((e, i) => (
        <div
          key={e.subject}
          className="flex items-center gap-3 text-xs px-3 py-2 rounded-lg bg-background/50 border border-border/50 hover:border-violet-500/30 transition-colors"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div
            className={`w-6 h-6 rounded-full ${e.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}
          >
            {e.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground/80">{e.from}</span>
              {e.unread && (
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </div>
            <p className="text-muted-foreground/70 truncate">{e.subject}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Mini demo: calendar ── */
function CalendarDemo() {
  const events = [
    { time: '10:00', title: 'Standup', color: 'bg-amber-500' },
    { time: '14:00', title: 'Design review', color: 'bg-blue-500' },
    { time: '15:30', title: 'Team sync', color: 'bg-emerald-500' },
  ];
  return (
    <div className="space-y-2 w-full">
      {events.map((e, i) => (
        <div
          key={e.title}
          className="flex items-center gap-3 text-xs px-3 py-2 rounded-lg bg-background/50 border border-border/50"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span className="text-muted-foreground/70 font-mono w-10 flex-shrink-0">
            {e.time}
          </span>
          <div className={`w-1 h-6 rounded-full ${e.color} flex-shrink-0`} />
          <span className="text-foreground/80">{e.title}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Mini demo: workflow flow ── */
function WorkflowMiniDemo() {
  const steps = ['Connect', 'Configure', 'Automate'];
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-3 rounded-lg bg-background/50 border border-border/50 w-full">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
              i === 2
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-primary/20 text-primary border border-primary/30'
            }`}
          >
            {i + 1}
          </div>
          <span className="text-xs text-foreground/70">{step}</span>
          {i < steps.length - 1 && (
            <ArrowRight className="w-3 h-3 text-muted-foreground/40" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Mini demo: privacy / self-host ── */
function PrivacyDemo() {
  const items = [
    { icon: '🔒', label: 'End-to-end encryption', active: true },
    { icon: '🏠', label: 'Self-hosted option', active: true },
    { icon: '🚫', label: 'No third-party tracking', active: true },
  ];
  return (
    <div className="space-y-2 w-full">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 text-xs px-3 py-2 rounded-lg bg-background/50 border border-border/50"
        >
          <span className="flex-shrink-0">{item.icon}</span>
          <span className="text-foreground/80 flex-1">{item.label}</span>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      ))}
    </div>
  );
}

const features = [
  {
    icon: CheckCircle,
    title: 'Todo Management',
    description:
      'Organize and prioritize tasks automatically. Smart reminders keep you on track.',
    gradient: 'bg-gradient-to-br from-emerald-500 to-teal-500',
    span: 'default' satisfies 'default' | 'wide' | 'tall',
    demo: TodoDemo,
  },
  {
    icon: Newspaper,
    title: 'Daily News Digest',
    description:
      'Personalized news briefing every morning, curated and summarized by AI.',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    span: 'default' satisfies 'default' | 'wide' | 'tall',
    demo: NewsDemo,
  },
  {
    icon: Mail,
    title: 'Email Assistant',
    description:
      'Summarize threads, draft replies, and never miss important messages.',
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
    span: 'default' satisfies 'default' | 'wide' | 'tall',
    demo: EmailDemo,
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description:
      'Daily briefings, meeting prep, and reminders for what matters.',
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-500',
    span: 'default' satisfies 'default' | 'wide' | 'tall',
    demo: CalendarDemo,
  },
  {
    icon: Zap,
    title: 'Ready-Made Workflows',
    description:
      'Pre-configured automations that just work. Connect once, automate forever.',
    gradient: 'bg-gradient-to-br from-rose-500 to-pink-500',
    span: 'default' satisfies 'default' | 'wide' | 'tall',
    demo: WorkflowMiniDemo,
  },
  {
    icon: Lock,
    title: 'Your Data, Yours',
    description:
      'Self-host for complete privacy or use our secure cloud. Full control, always.',
    gradient: 'bg-gradient-to-br from-indigo-500 to-blue-500',
    span: 'default' satisfies 'default' | 'wide' | 'tall',
    demo: PrivacyDemo,
  },
] as const;

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 mb-6">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Powered by AI
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Automate Your Daily Life
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pre-built automations for the things you do every day. Set it up
              once, enjoy the productivity boost forever.
            </p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <ScrollReveal
              key={feature.title}
              delay={idx * 80}
              className="h-full"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                span={feature.span}
              >
                {feature.demo && <feature.demo />}
              </FeatureCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
