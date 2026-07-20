import { Check } from 'lucide-react';
import { IconCard } from '@/components/ui/icon-card';
import { CONNECTIONS } from './data';

export function Connections() {
  return (
    <section id="conexoes" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-foreground">
          Seus canais de venda, todos no mesmo lugar
        </h2>
        <p className="mt-3 text-muted-foreground">
          Autorize uma vez, receba pedido de todo canal no seu ERP sem acessar painel de
          marketplace nenhum pra conferir venda.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CONNECTIONS.map(({ image, name, description, tagline, tagIcon, comingSoon }) => (
          <IconCard
            key={name}
            image={{ src: image, alt: name }}
            title={name}
            description={description}
            tag={{ label: tagline, icon: tagIcon ?? Check }}
            className={comingSoon ? 'border-dashed opacity-70 hover:border-dashed' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
