import Link from 'next/link';
import Image from 'next/image';
import { FOOTER_PRODUCT_LINKS, FOOTER_CONTACTS, MARKETPLACES } from './data';

export function Footer() {
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
                  {...(href.startsWith('http')
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
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
