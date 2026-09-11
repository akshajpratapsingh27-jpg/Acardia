import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import type { ReactNode } from 'react';

export function DashboardCard({
  href,
  icon,
  title,
  className = '',
  children,
  testId,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  className?: string;
  children?: ReactNode;
  testId: string;
}) {
  return (
    <Link
      href={href}
      className={`group panel-shadow relative flex flex-col rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[hsl(44_74%_63%/0.65)] hover:shadow-xl focus-visible:outline focus-visible:outline-3 focus-visible:outline-[hsl(var(--accent))] focus-visible:outline-offset-[-3px] ${className}`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
          {icon}
        </div>
        <span className="pointer-events-none flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition group-hover:border-[hsl(var(--accent))] group-hover:bg-[hsl(var(--accent))] group-hover:text-[hsl(var(--primary))]">
          <ChevronRight size={16} />
        </span>
      </div>
      <h3 className="mt-5 font-serif text-xl text-[hsl(var(--foreground))]">{title}</h3>
      <div className="mt-3 flex-1">{children}</div>
    </Link>
  );
}
