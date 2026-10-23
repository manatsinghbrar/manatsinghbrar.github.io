import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Served from the root of manatsinghbrar.pages.dev (Cloudflare Pages), so base stays '/'.
// A custom domain later only changes `site` and adds public/CNAME.
export default defineConfig({
  site: 'https://manatsinghbrar.pages.dev',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
});
