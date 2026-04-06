import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hub de Integração de Marketplaces',
  description: 'Conecte seu ERP ao Mercado Livre e Shopee',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
