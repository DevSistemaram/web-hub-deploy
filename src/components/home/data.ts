import {
  Clock,
  FileCheck,
  Mail,
  MessageCircle,
  PackageCheck,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { FaInstagram, FaYoutube } from 'react-icons/fa6';
import type { LucideIcon } from 'lucide-react';

export type Connection = {
  image: string;
  name: string;
  description: string;
  tagline: string;
  tagIcon?: LucideIcon;
  comingSoon?: boolean;
};

export const CONNECTIONS: Connection[] = [
  {
    image: '/mercado_livre.svg',
    name: 'Mercado Livre',
    description: 'O maior marketplace da América Latina, direto no seu ERP.',
    tagline: 'Maior alcance do Brasil',
  },
  {
    image: '/shopee.svg',
    name: 'Shopee',
    description: 'Milhões de compradores todos os dias, pedidos sincronizados.',
    tagline: 'Sincronização automática',
  },
  {
    image: '/amazon.svg',
    name: 'Amazon',
    description: 'Um dos maiores marketplaces do mundo, pedidos direto no seu ERP.',
    tagline: 'Alcance internacional',
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
    tagline: 'Sua loja, seu domínio',
  },
  {
    image: '/ifood.svg',
    name: 'iFood',
    description: 'Pedidos de delivery sincronizados com o mesmo fluxo do seu ERP.',
    tagline: 'Delivery integrado',
  },
  {
    image: '/uairango.svg',
    name: 'UaiRango',
    description: 'Canal de delivery regional conectado ao seu ERP.',
    tagline: 'Delivery integrado',
  },
  {
    image: '/ze_delivery.svg',
    name: 'Zé Delivery',
    description: 'Em breve: mais um canal de delivery no seu Hub RAM.',
    tagline: 'Em breve',
    tagIcon: Clock,
    comingSoon: true,
  },
];

export const MARKETPLACES = CONNECTIONS.map((c) => c.name);

export const FEATURES = [
  {
    icon: PackageCheck,
    title: 'Importação de Pedidos',
    tag: 'Automático',
    description:
      'Pedidos de todos os canais chegam no ERP sem digitação manual padronizados e prontos para faturar.',
  },
  {
    icon: RefreshCw,
    title: 'Saldo & Estoque',
    tag: 'Em tempo real',
    description:
      'Baixa de estoque sincronizada com o ERP ao confirmar venda. Evite vender produto sem saldo.',
  },
  {
    icon: Tag,
    title: 'Preços Atualizados',
    tag: 'Multi-canal',
    description:
      'Altere o preço no ERP e o hub propaga a mudança para todos os marketplaces conectados.',
  },
  {
    icon: FileCheck,
    title: 'Retorno de NF-e',
    tag: 'Fiscal',
    description:
      'Envie a nota fiscal ao marketplace direto pelo hub ciclo de venda completo e em conformidade.',
  },
];

export const STEPS = [
  {
    title: 'Crie sua conta',
    description: 'Cadastro gratuito em menos de um minuto.',
  },
  {
    title: 'Conecte os marketplaces',
    description: 'Autorize Mercado Livre, Shopee, Ideris e Nuvemshop.',
  },
  {
    title: 'Ciclo completo no seu ERP',
    description: 'Pedidos, estoque, preços e NF-e tudo sincronizado automaticamente.',
  },
];

export const NAV_LINKS = [
  { label: 'Integrações', href: '/#conexoes' },
  { label: 'Preços', href: '/#precos' },
];

export const WHATSAPP_PHONE = '5519993617069';

export function whatsappPlanLink(plan: string) {
  const text = `Olá! Tenho interesse no Hub RAM, no plano ${plan}.`;
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(text)}`;
}

export const PLANS = [
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

export const FAQ_ITEMS = [
  {
    question: 'O que é o Hub RAM?',
    answer:
      'Integração nativa do ERP Sistema RAM com marketplaces e plataformas de venda. Pedidos, estoque, preços e NF-e sincronizados automaticamente, sem digitação manual.',
  },
  {
    question: 'Preciso ter o ERP Sistema RAM pra usar o Hub RAM?',
    answer:
      'O Hub RAM foi criado como a integração nativa do Sistema RAM, mas também está aberto pra outros sistemas que queiram integrar seus canais de venda.',
  },
  {
    question: 'Quais marketplaces e plataformas o Hub RAM integra?',
    answer:
      'Mercado Livre, Shopee, Amazon, Nuvemshop, Ideris, iFood e UaiRango, com Zé Delivery chegando em breve.',
  },
  {
    question: 'O cadastro é gratuito?',
    answer: 'Sim. Cadastro gratuito, sem cartão de crédito, em menos de um minuto.',
  },
  {
    question: 'Como funciona o preço do Hub RAM?',
    answer:
      'O valor é escalonado pelo volume de pedidos processados por mês, somando todos os canais conectados. Veja os planos na seção de preços.',
  },
  {
    question: 'O estoque fica sincronizado entre os canais?',
    answer:
      'Sim. A baixa de estoque é sincronizada com o ERP automaticamente ao confirmar a venda, em qualquer canal conectado.',
  },
  {
    question: 'Consigo emitir nota fiscal pelos marketplaces conectados?',
    answer:
      'Sim. O retorno de NF-e é enviado ao marketplace direto pelo Hub RAM, mantendo o ciclo de venda completo.',
  },
];

export const FOOTER_PRODUCT_LINKS = [
  { label: 'Entrar', href: '/login' },
  { label: 'Criar conta', href: '/register' },
  { label: 'Site Sistema RAM', href: 'https://sistemaram.com.br' },
];

export const FOOTER_CONTACTS = [
  {
    icon: Mail,
    label: 'suporte@sistemaram.com.br',
    href: 'mailto:suporte@sistemaram.com.br',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    href: `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}`,
  },
  {
    icon: FaInstagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/sistemaram',
  },
  {
    icon: FaYoutube,
    label: 'YouTube',
    href: 'https://www.youtube.com/@SistemaRAM',
  },
];
