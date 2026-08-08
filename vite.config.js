import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// <!--#include partials/head.html--> — head meta, header and footer live in
// src/partials/ so they are edited in one place. Substitution only; adding a
// blog later means adding an input, not replacing this.
const partials = () => ({
  name: 'partials',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html.replace(/<!--#include\s+([^\s]+?)\s*-->/g, (_, file) =>
        readFileSync(resolve(import.meta.dirname, 'src', file), 'utf8')
      );
    },
  },
});

export default {
  base: '/',
  plugins: [partials()],
};
