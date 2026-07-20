import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowRight, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONNECTIONS } from './data';

const HERO_ICONS = CONNECTIONS.filter((c) => !c.comingSoon).slice(0, 6);

export function Hero() {
  return (
    <section className="bg-gradient-to-b from-primary/10 via-primary/5 to-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-8">
        <div className="text-center lg:text-left">
          <Badge variant="secondary" className="gap-1.5 py-1.5 pl-2.5 pr-3">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Criado pro Sistema RAM, aberto pra outros sistemas
          </Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Chega de copiar pedido de marketplace pro ERP na mão
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground lg:mx-0">
            O Hub RAM conecta seu ERP a 8 canais de venda (Mercado Livre, Shopee, Amazon, iFood
            e mais). Pedidos, estoque, preços e NF-e sincronizados automaticamente, sem digitar
            nada duas vezes.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
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
          <p className="mt-4 text-xs text-muted-foreground/70">
            Cadastro gratuito, sem cartão de crédito. Leva menos de um minuto.
          </p>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-2xl border bg-card/60 p-6 shadow-sm backdrop-blur">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Seus canais de venda
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {HERO_ICONS.map(({ image, name }) => (
              <span
                key={name}
                className="flex h-14 w-full items-center justify-center rounded-xl border bg-background"
              >
                <Image src={image} alt={name} width={28} height={28} className="h-7 w-7 object-contain" />
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-col items-center gap-1 text-primary">
            <ArrowDown className="h-5 w-5" />
            <span className="text-xs font-medium">sincronizado automaticamente</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
            <Image src="/icon.svg" alt="Sistema RAM" width={18} height={18} className="h-[18px] w-[18px]" />
            Sistema RAM ERP
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 pb-10">
        <p className="text-xs text-muted-foreground/60">Veja as integrações disponíveis</p>
        <ChevronDown aria-hidden="true" className="h-5 w-5 animate-bounce text-muted-foreground/40" />
      </div>
    </section>
  );
}
