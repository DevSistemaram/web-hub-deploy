import type { Metadata, Viewport } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hub.ramnuvem.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  applicationName: 'Hub RAM',

  title: {
    default: 'Hub RAM — Integração de Marketplaces',
    template: '%s | Hub RAM',
  },
  description:
    'Conecte o ERP Sistema RAM ao Mercado Livre, Shopee e outros marketplaces. Gerencie integrações, sincronize pedidos e automatize operações de venda.',
  keywords: [
    'ERP',
    'integração marketplace',
    'Mercado Livre',
    'Shopee',
    'Sistema RAM',
    'Hub RAM',
    'gestão de pedidos',
    'automação de vendas',
    'integração ERP',
  ],

  authors: [{ name: 'Sistema RAM', url: 'https://sistemaram.com.br' }],
  creator: 'Sistema RAM',
  publisher: 'Sistema RAM',
  category: 'business',

  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: { index: false, follow: false },
  },

  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'Hub RAM',
    title: 'Hub RAM — Integração de Marketplaces',
    description:
      'Conecte o ERP Sistema RAM ao Mercado Livre, Shopee e outros marketplaces.',
    images: [
      {
        url: '/RAMHub.png',
        width: 1200,
        height: 630,
        alt: 'Hub RAM — Sistema RAM',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary',
    title: 'Hub RAM — Integração de Marketplaces',
    description:
      'Conecte o ERP Sistema RAM ao Mercado Livre, Shopee e outros marketplaces.',
    images: ['/RAMHub.png'],
  },

  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon.svg',
  },

  alternates: {
    canonical: APP_URL,
    languages: { 'pt-BR': APP_URL },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark');})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
