import { STEPS } from './data';

export function HowItWorks() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Como funciona</h2>
          <p className="mt-3 text-muted-foreground">
            Da conta criada ao primeiro pedido sincronizado em três passos.
          </p>
        </div>
        <ol className="relative mt-14 grid gap-10 sm:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-5 hidden h-px bg-border sm:block"
            style={{ marginInline: 'calc(100% / 6)' }}
          />
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative text-center">
              <span className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-4 ring-background">
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
