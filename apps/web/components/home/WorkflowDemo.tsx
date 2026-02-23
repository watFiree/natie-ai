'use client';

import { CheckCircle, Newspaper, Mail, Calendar, Check } from 'lucide-react';

const dailyFlow = [
  { title: 'Morning Briefing', desc: 'News & todos' },
  { title: 'Email Summary', desc: 'What needs reply' },
  { title: 'Day Planning', desc: 'Calendar & tasks' },
  { title: 'Evening Wrap', desc: 'Progress & tomorrow' },
];

const workflowFeatures = [
  'Connect your favorite apps in one click',
  'AI curates what matters to you',
  'Works with Notion, Gmail, Calendar, RSS',
  'New automations added regularly',
];

export function WorkflowDemo() {
  return (
    <section id="workflows" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            A Day with Natie
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how predefined workflows handle your daily routines
          </p>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent hidden lg:block" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dailyFlow.map((step, idx) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg shadow-primary/25">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">
                Predefined Workflows, Zero Setup
              </h3>
              <p className="text-muted-foreground mb-6">
                No complex configuration needed. Natie comes with ready-made
                automations for your daily life. Just connect your accounts and
                go.
              </p>
              <ul className="space-y-3">
                {workflowFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full max-w-md">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-secondary to-background border border-border p-6 flex items-center justify-center">
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">3 tasks today</div>
                      <div className="text-xs text-muted-foreground">
                        From Notion
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Newspaper className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">5 articles</div>
                      <div className="text-xs text-muted-foreground">
                        Morning digest
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">2 emails</div>
                      <div className="text-xs text-muted-foreground">
                        Need attention
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-card border border-border">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">4 meetings</div>
                      <div className="text-xs text-muted-foreground">Today</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
