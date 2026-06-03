import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  Check,
  Globe,
  Mail,
  MessageCircle,
  Package2,
  ShoppingBag,
  ShoppingCart,
  SquarePlay,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-static';

const MARKETPLACES = ['Mercado Livre', 'Shopee', 'Ideris', 'Nuvemshop'];

const CONNECTIONS = [
  {
    icon: ShoppingCart,
    name: 'Mercado Livre',
    description: 'O maior marketplace da América Latina, direto no seu ERP.',
    tagline: 'Conexão oficial via OAuth',
  },
  {
    icon: ShoppingBag,
    name: 'Shopee',
    description: 'Milhões de compradores todos os dias, pedidos sincronizados.',
    tagline: 'Conexão oficial via OAuth',
  },
  {
    icon: Package2,
    name: 'Ideris',
    description: 'Hub que multiplica seus canais de venda em um só lugar.',
    tagline: 'Integração oficial via API',
  },
  {
    icon: Globe,
    name: 'Nuvemshop',
    description: 'Sua loja própria integrada ao mesmo fluxo de pedidos.',
    tagline: 'Conexão oficial via OAuth',
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
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
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
      </div>
    </section>
  );
}

function Connections() {
  return (
    <section id="conexoes" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-foreground">
          Conecte-se aos maiores canais de venda do Brasil
        </h2>
        <p className="mt-3 text-muted-foreground">
          Uma conexão dedicada para cada marketplace — autorize uma vez e receba todos os pedidos
          no mesmo fluxo.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CONNECTIONS.map(({ icon: Icon, name, description, tagline }) => (
          <Card key={name} className="transition hover:border-primary/40 hover:shadow-md">
            <CardContent className="pt-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
                <Check className="h-3.5 w-3.5" />
                {tagline}
              </p>
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

const FOOTER_PRODUCT_LINKS = [
  { label: 'Entrar', href: '/login' },
  { label: 'Criar conta', href: '/register' },
  { label: 'Site Sistema RAM', href: 'https://sistemaram.com.br' },
];

const FOOTER_CONTACTS = [
  {
    icon: Mail,
    label: 'suporte@sistemaram.com.br',
    href: 'mailto:suporte@sistemaram.com.br',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    href: 'https://api.whatsapp.com/send?phone=5519993617069',
  },
  {
    icon: Camera,
    label: 'Instagram',
    href: 'https://www.instagram.com/sistemaram',
  },
  {
    icon: SquarePlay,
    label: 'YouTube',
    href: 'https://www.youtube.com/@SistemaRAM',
  },
];

function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/RAMHub.svg" alt="Hub RAM" width={120} height={36} className="h-8 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Seu ERP conectado aos maiores marketplaces do Brasil. Pedidos centralizados em um
            único fluxo.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Produto</h3>
          <ul className="mt-4 space-y-3">
            {FOOTER_PRODUCT_LINKS.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Integrações</h3>
          <ul className="mt-4 space-y-3">
            {MARKETPLACES.map((m) => (
              <li key={m}>
                <Link
                  href="/#conexoes"
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                >
                  {m}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Contato</h3>
          <ul className="mt-4 space-y-3">
            {FOOTER_CONTACTS.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  {...(href.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sistema RAM. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Connections />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </main>
  );
}
