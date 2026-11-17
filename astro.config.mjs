import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The one place the public address is set. Canonical links, the sitemap,
  // robots.txt and llms.txt all follow it.
  site: 'https://sparkdo.org',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
