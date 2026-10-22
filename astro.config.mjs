import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Root GitHub Pages repo (manatsinghbrar.github.io), so base stays '/'.
// A custom domain later only changes `site` and adds public/CNAME.
export default defineConfig({
  site: 'https://manatsinghbrar.github.io',
  trailingSlash: 'always',
  integrations: [sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { inlineStylesheets: 'auto' },
});
