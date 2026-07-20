import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { FAQ_ITEMS } from './data';

export function FAQ() {
  return (
    <section className="scroll-mt-20 border-t bg-secondary/50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground">Perguntas frequentes</h2>
          <p className="mt-3 text-muted-foreground">
            Tudo que você precisa saber antes de conectar seus canais de venda.
          </p>
        </div>
        <Accordion type="single" collapsible className="mx-auto mt-12 max-w-3xl">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="text-left text-foreground">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
