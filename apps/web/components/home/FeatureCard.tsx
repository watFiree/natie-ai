'use client';

import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  span?: 'default' | 'wide' | 'tall';
  children?: React.ReactNode;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  span = 'default',
  children,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative h-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-500 hover:border-primary/40 overflow-hidden',
        span === 'wide' && 'md:col-span-2',
        span === 'tall' && 'md:row-span-2'
      )}
    >
      {/* Gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500 pointer-events-none" />

      <div className="relative p-6 h-full flex flex-col">
        <div className="flex items-start gap-4 mb-3">
          <div
            className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg',
              gradient
            )}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold mb-1">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {children && (
          <div className="flex-1 flex items-center w-full pt-4">{children}</div>
        )}
      </div>
    </div>
  );
}
