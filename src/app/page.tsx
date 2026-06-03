import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  Mail,
  MessageCircle,
  SquarePlay,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-static';

const MARKETPLACES = ['Mercado Livre', 'Shopee', 'Ideris', 'Nuvemshop'];

const CONNECTIONS = [
  {
    image: '/mercado_livre.svg',
    name: 'Mercado Livre',
    description: 'O maior marketplace da América Latina, direto no seu ERP.',
    tagline: 'Conexão oficial',
  },
  {
    image: '/shopee.svg',
    name: 'Shopee',
    description: 'Milhões de compradores todos os dias, pedidos sincronizados.',
    tagline: 'Conexão oficial',
  },
  {
    image: '/ideris.svg',
    name: 'Ideris',
    description: 'Hub que multiplica seus canais de venda em um só lugar.',
    tagline: 'Integração oficial',
  },
  {
    image: '/nuvemshop.svg',
    name: 'Nuvemshop',
    description: 'Sua loja própria integrada ao mesmo fluxo de pedidos.',
    tagline: 'Conexão oficial',
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
    <section className="bg-gradient-to-br from-primary/10 to-primary/20">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/20">
          <Check className="h-3.5 w-3.5" />
          4 marketplaces integrados
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Seu ERP conectado aos maiores marketplaces do Brasil
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Conecte qualquer ERP em minutos e receba todos os pedidos centralizados em um formato
          padronizado. Menos retrabalho, mais vendas.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/register">
              Criar conta grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
        <div className="mt-12 flex flex-col items-center gap-1.5">
          <p className="text-xs text-muted-foreground/60">Veja as integrações disponíveis</p>
          <ChevronDown className="h-5 w-5 animate-bounce text-muted-foreground/40" />
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
        {CONNECTIONS.map(({ image, name, description, tagline }) => (
          <Card key={name} className="transition hover:border-primary/40 hover:shadow-md">
            <CardContent className="pt-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Image src={image} alt={name} width={24} height={24} className="h-6 w-6 object-contain" />
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

const WHATSAPP_PHONE = '5519993617069';

function whatsappPlanLink(plan: string) {
  const text = `Olá! Tenho interesse no Hub RAM, no plano ${plan}.`;
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;
}

const PLANS = [
  {
    name: 'Até 500 pedidos/mês',
    price: 'R$ 350',
    period: '/mês',
    description: 'Todos os canais somados.',
    highlight: false,
  },
  {
    name: '501 a 1.000 pedidos/mês',
    price: 'R$ 650',
    period: '/mês',
    description: 'Ao dobrar o volume, o custo não dobra.',
    highlight: true,
  },
  {
    name: 'Acima de 1.000 pedidos',
    price: 'Sob consulta',
    period: '',
    description: 'Valores negociados de forma personalizada, garantindo sempre a melhor condição.',
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="precos" className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Investimento e Condições Comerciais
          </h2>
          <p className="mt-3 text-muted-foreground">
            Preço previsível, escalonado pelo seu volume de pedidos.
          </p>
        </div>

        {/* <div className="mx-auto mt-10 flex max-w-3xl items-start gap-4 rounded-lg border border-primary/30 bg-primary/5 p-5 sm:items-center">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-5 w-5 text-primary" />
          </span>
          <div className="text-left">
            <p className="font-semibold text-foreground">
              Taxa de Implantação: <span className="text-primary">R$ 0,00</span> — Isento
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Como incentivo à nossa parceria, absorvemos 100% dos custos iniciais de setup.
            </p>
          </div>
        </div> */}

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PLANS.map(({ name, price, period, description, highlight }) => (
            <Card
              key={name}
              className={
                highlight
                  ? 'relative border-primary shadow-md'
                  : 'transition hover:border-primary/40 hover:shadow-md'
              }
            >
              {highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Melhor custo por pedido
                </span>
              )}
              <CardContent className="pt-6 text-center">
                <h3 className="text-sm font-semibold text-muted-foreground">{name}</h3>
                <p className="mt-4 text-3xl font-bold text-foreground">
                  {price}
                  {period && (
                    <span className="text-base font-medium text-muted-foreground">{period}</span>
                  )}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
                <Button
                  variant={highlight ? 'default' : 'outline'}
                  asChild
                  className="mt-6 w-full"
                >
                  <a href={whatsappPlanLink(name)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Falar com o suporte
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
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
      <Pricing />
      <Footer />
    </main>
  );
}
