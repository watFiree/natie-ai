'use client';

export function AnimatedGradient() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-slow-pulse" />
      <div
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-slow-pulse"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-2/5 rounded-full blur-[150px] animate-slow-pulse"
        style={{ animationDelay: '4s' }}
      />
      <div
        className="absolute top-1/4 right-1/4 w-[280px] h-[280px] bg-primary/5 rounded-full blur-[80px] animate-float"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-[240px] h-[240px] bg-chart-4/5 rounded-full blur-[90px] animate-float"
        style={{ animationDelay: '2.5s' }}
      />
      <div
        className="absolute top-3/4 right-1/3 w-[200px] h-[200px] bg-chart-2/5 rounded-full blur-[70px] animate-float"
        style={{ animationDelay: '1.5s' }}
      />
    </div>
  );
}
