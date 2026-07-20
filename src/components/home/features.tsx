import { Zap } from 'lucide-react';
import { IconCard } from '@/components/ui/icon-card';
import { FEATURES } from './data';

export function Features() {
  return (
    <section className="border-t bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Menos trabalho manual, mais tempo pra vender</h2>
          <p className="mt-3 text-muted-foreground">
            Do pedido recebido à nota enviada sem planilha, sem cópia manual, sem retrabalho.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon, title, tag, description }) => (
            <IconCard
              key={title}
              icon={icon}
              title={title}
              description={description}
              tag={{ label: tag, icon: Zap }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
