'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

type Message = { role: 'user' | 'ai'; text: string };
type Example = { label: string; prompt: string; messages: [Message, Message] };

const examples: Example[] = [
  {
    label: 'Inbox summary',
    prompt: "What's in my inbox today?",
    messages: [
      { role: 'user', text: "What's in my inbox today?" },
      {
        role: 'ai',
        text: 'You have 3 emails worth your attention:\n\n• Sarah invited you to a team sync tomorrow at 3pm\n• Your AWS bill is ready to review ($42.80)\n• James requested a PR review on natie-ai',
      },
    ],
  },
  {
    label: 'Reply to email',
    prompt: "Reply to Sarah, say I'll be there",
    messages: [
      { role: 'user', text: "Reply to Sarah, say I'll be there" },
      {
        role: 'ai',
        text: 'Done! I sent Sarah this reply:\n\n"Hi Sarah, thanks for the invite — I\'ll be there for the team sync tomorrow at 3pm. Looking forward to it!"\n\nEmail sent ✓',
      },
    ],
  },
  {
    label: 'Morning briefing',
    prompt: 'Give me my morning briefing',
    messages: [
      { role: 'user', text: 'Give me my morning briefing' },
      {
        role: 'ai',
        text: "Good morning! Here's your day:\n\n📧 3 emails need your attention\n📅 2 meetings — 10am standup, 3pm team sync\n✅ 5 tasks due today\n📰 Top story: New AI breakthrough from DeepMind",
      },
    ],
  },
];

type Phase = 'idle' | 'user' | 'typing' | 'done';

export function ChatDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [typedText, setTypedText] = useState('');
  const cleanupRef = useRef<() => void>(() => undefined);

  const example = examples[activeIdx];

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    setPhase('idle');
    setTypedText('');

    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        setPhase('user');

        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setPhase('typing');

            const aiText = examples[activeIdx].messages[1].text;
            let i = 0;

            const tick = () => {
              if (cancelled) return;
              i++;
              setTypedText(aiText.slice(0, i));
              if (i < aiText.length) {
                timers.push(setTimeout(tick, 16));
              } else {
                setPhase('done');
              }
            };

            tick();
          }, 700)
        );
      }, 350)
    );

    cleanupRef.current = () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };

    return () => cleanupRef.current();
  }, [activeIdx]);

  // Auto-cycle examples
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % examples.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See Natie in Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Just ask in plain language. Natie handles the rest.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Example selector */}
          <ScrollReveal delay={100}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
              Try an example
            </p>
            <div className="space-y-3">
              {examples.map((ex, idx) => (
                <button
                  key={ex.label}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 ${
                    activeIdx === idx
                      ? 'border-primary/60 bg-primary/10 text-foreground'
                      : 'border-border bg-card/30 text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${
                        activeIdx === idx ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                    <span className="font-medium text-sm">{ex.label}</span>
                  </div>
                  <p className="mt-1.5 ml-5 text-xs opacity-70 truncate">
                    &ldquo;{ex.prompt}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Chat window */}
          <ScrollReveal delay={200}>
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/30">
                {/* Title bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Natie AI</span>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-5 space-y-4 min-h-[220px] flex flex-col justify-end">
                  {phase !== 'idle' && (
                    <div
                      key={`user-${activeIdx}`}
                      className="flex justify-end animate-fade-in-up"
                      style={{ animationDuration: '0.3s' }}
                    >
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm leading-relaxed">
                        {example.messages[0].text}
                      </div>
                    </div>
                  )}

                  {(phase === 'typing' || phase === 'done') && (
                    <div
                      key={`ai-${activeIdx}`}
                      className="flex gap-3 items-start animate-fade-in-up"
                      style={{ animationDuration: '0.3s' }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                        N
                      </div>
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-secondary text-secondary-foreground text-sm leading-relaxed whitespace-pre-line">
                        {phase === 'done'
                          ? example.messages[1].text
                          : typedText}
                        {phase === 'typing' && (
                          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 align-middle animate-blink-cursor" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 border-t border-border flex items-center gap-3">
                  <div className="flex-1 h-9 rounded-lg bg-muted/30 border border-border px-3 flex items-center text-sm text-muted-foreground/50">
                    Ask Natie anything...
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 -z-10 blur-md" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
