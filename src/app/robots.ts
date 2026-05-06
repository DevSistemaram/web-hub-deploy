import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hub.sistemaram.com.br';

const AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'CCBot',
  'anthropic-ai',
  'Claude-Web',
  'Applebot-Extended',
  'Bytespider',
  'FacebookBot',
  'PerplexityBot',
  'YouBot',
  'cohere-ai',
  'Diffbot',
  'ImagesiftBot',
  'Omgili',
  'Omgilibot',
  'facebookexternalhit',
  'ia_archiver',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Block all AI crawlers completely
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: ['/', '/login', '/register'],
        disallow: ['/dashboard/', '/api/'],
      })),
      // Block all other bots from private routes
      {
        userAgent: '*',
        allow: ['/', '/login', '/register'],
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
