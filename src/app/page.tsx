import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check, LayoutDashboard, PackageCheck, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-static';

const MARKETPLACES = ['Mercado Livre', 'Shopee', 'Ideris', 'Nuvemshop'];

const FEATURES = [
  {
    icon: Plug,
    title: 'Conexão em minutos',
    description:
      'Autorize suas contas nos marketplaces com poucos cliques. Sem configuração técnica complicada.',
  },
  {
    icon: PackageCheck,
    title: 'Pedidos padronizados',
    description:
      'Receba os pedidos de todos os canais em um formato único, pronto para qualquer ERP.',
  },
  {
    icon: LayoutDashboard,
    title: 'Tudo em um só lugar',
    description:
      'Gerencie integrações e acompanhe a sincronização de pedidos em um painel único.',
  },
];

const STEPS = [
  {
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de um minuto.',
  },
  {
    title: 'Conecte os marketplaces',
    description: 'Autorize Mercado Livre, Shopee, Ideris e Nuvemshop.',
  },
  {
    title: 'Receba pedidos no seu ERP',
    description: 'Pedidos centralizados em formato padronizado, prontos para integrar.',
  },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Image src="/RAMHub.svg" alt="Hub RAM" width={120} height={36} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Criar conta grátis</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Mercado Livre · Shopee · Ideris · Nuvemshop
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Seu ERP conectado aos maiores marketplaces do Brasil
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Conecte qualquer ERP em minutos e receba todos os pedidos centralizados em um formato
          padronizado. Menos retrabalho, mais vendas.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              Criar conta grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {MARKETPLACES.map((m) => (
            <li key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </span>
              {m}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-foreground">
          Tudo que você precisa para vender mais
        </h2>
        <p className="mt-3 text-muted-foreground">
          Centralize seus canais de venda e deixe a integração com a gente.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <CardContent className="pt-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="border-t bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Como funciona</h2>
          <p className="mt-3 text-muted-foreground">
            Da conta criada ao primeiro pedido sincronizado em três passos.
          </p>
        </div>
        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-primary">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-primary-foreground">
          Comece a vender de forma integrada hoje
        </h2>
        <p className="mt-3 text-primary-foreground/70">
          Crie sua conta gratuita e conecte seu primeiro marketplace em minutos.
        </p>
        <Button size="lg" variant="secondary" asChild className="mt-8">
          <Link href="/register">
            Criar conta grátis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <Image src="/RAMHub.svg" alt="Hub RAM" width={100} height={30} className="h-7 w-auto" />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sistema RAM. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </main>
  );
}
