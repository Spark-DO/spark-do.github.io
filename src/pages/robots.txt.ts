import { SITE } from '../lib/content.js';

const body = `# Everything on this site is public. Search engines and AI crawlers are welcome.
# A plain-text guide for language models is at /llms.txt.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap-index.xml
`;

export const GET = () => new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
