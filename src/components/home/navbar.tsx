import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { NAV_LINKS } from './data';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Image src="/RAMHub.svg" alt="Hub RAM" width={120} height={36} className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Criar conta grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
