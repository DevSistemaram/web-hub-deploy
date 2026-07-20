import { MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PLANS, whatsappPlanLink } from './data';

export function Pricing() {
  return (
    <section id="precos" className="scroll-mt-20 border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Investimento e Condições Comerciais
          </h2>
          <p className="mt-3 text-muted-foreground">
            Preço previsível, escalonado pelo seu volume de pedidos.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PLANS.map(({ name, price, period, description, highlight }) => (
            <Card
              key={name}
              className={
                highlight
                  ? 'relative border-[hsl(var(--accent-warm))] shadow-lg lg:scale-105'
                  : 'transition hover:border-primary/40 hover:shadow-md'
              }
            >
              {highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--accent-warm))] px-3 py-0.5 text-xs font-semibold text-[hsl(var(--accent-warm-foreground))]">
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
                    Quero esse plano
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
