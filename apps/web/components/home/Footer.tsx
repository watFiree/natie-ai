'use client';

import Image from 'next/image';

const links = [
  { label: 'Documentation', href: 'https://docs.natie.ai' },
  { label: 'GitHub', href: 'https://github.com/watFiree/natie-ai' },
  { label: 'Discord', href: 'https://discord.gg/natie-ai' },
  { label: 'Twitter', href: 'https://twitter.com/natie-ai' },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
            <span className="text-lg font-bold">Natie AI</span>
          </div>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Natie AI. Open source under MIT.
          </p>
        </div>
      </div>
    </footer>
  );
}
