// All visible content lives here. Source of truth: the resume (Oct 2026). Case pages add only
// detail the author already approved in v1 copy (IndexedDB paging 50 to 100 rows, auto-sized
// columns, memory work on process trees). Nothing here is a placeholder.
// Deliberately absent: phone number, screenshots or mocks of Privafy's product (NDA).

export type Level = 'Intern' | 'Engineer' | 'Senior';

export type Figure =
  | { kind: 'area'; from: { value: number; label: string }; to: { value: number; label: string } }
  | { kind: 'bars'; from: { value: number; label: string }; to: { value: number; label: string } }
  | { kind: 'cells'; total: number; filled: number; unit: string; caption: string }
  | { kind: 'stream'; caption: string }
  | { kind: 'steps'; steps: string[]; caption: string };

export type Case = {
  slug: string;
  title: string;
  area: string;
  levels: Level[];
  result: string;
  stack: string[];
  summary: string; // one sentence, also the meta description
  figure: Figure;
  body: { heading: string; text: string[] }[];
};

export const site = {
  name: 'Manat Singh Brar',
  role: 'Frontend engineer',
  title: 'Senior software engineer, frontend',
  employer: 'Privafy',
  url: 'https://manatsinghbrar.pages.dev',
  city: 'Bangalore',
  tz: 'Asia/Kolkata',
  description:
    'Frontend engineer at Privafy. I build the React screens security analysts work in all day, and keep them fast at millions of records.',
  email: 'manatsinghbrar@gmail.com',
  linkedin: 'https://www.linkedin.com/in/manat-singh-brar',
  cv: '/manat-singh-brar-resume.pdf',
  statement: 'I build the screens security analysts work in all day, and keep them fast at millions of records.',
  // The phrase in the statement lit like a search hit (must appear in `statement` verbatim).
  statementHit: 'millions of records',
  seeking: 'Looking for SDE 2 frontend roles at product companies and startups. Bangalore, remote or hybrid.',
};

export const levelRank: Record<Level, number> = { Intern: 0, Engineer: 1, Senior: 2 };

export const cases: Case[] = [
  {
    slug: 'bundle',
    title: 'The ten megabyte bundle',
    area: 'Performance',
    levels: ['Engineer'],
    result: '10.4 MB → 390 KB',
    stack: ['Webpack 5', 'Code splitting', 'Lazy loading', 'Tree shaking', 'Brotli', 'Bundle analysis'],
    summary:
      'Cut the analyst portal’s main JavaScript bundle by 96%, and its first load from over three minutes to about two seconds.',
    figure: {
      kind: 'area',
      from: { value: 10400, label: '10.4 MB uncompressed, before' },
      to: { value: 390, label: '390 KB with Brotli, after' },
    },
    body: [
      {
        heading: 'Context',
        text: [
          'The production build shipped a 10.4 MB main bundle: unminified, uncompressed, nothing stripped. First load of the portal took more than three minutes, and every analyst in the organisation waited through it before they could start work.',
        ],
      },
      {
        heading: 'What I did',
        text: [
          'I fixed the pipeline first, so what shipped was minified and compressed with Brotli. Then I split the code, lazy-loaded what nobody needs on the first screen, and let tree shaking remove the rest.',
          'Stable content hashes mean a chunk that did not change stays cached in the browser from one release to the next, so returning analysts download only what is new.',
        ],
      },
      {
        heading: 'Outcome',
        text: [
          'The main bundle went from 10.4 MB uncompressed to 390 KB transferred with Brotli, a 96% cut. First load dropped from over three minutes to about two seconds. That is the whole portal, not a demo page.',
          'This work, with the UI revamp around it, is what my two SPOT awards recognised.',
        ],
      },
    ],
  },
  {
    slug: 'build',
    title: 'Off Create React App',
    area: 'Build tooling',
    levels: ['Engineer'],
    result: '55% less JavaScript',
    stack: ['esbuild', 'Webpack 5', 'Gzip', 'Brotli', 'React 19', 'Node 20'],
    summary:
      'Replaced Babel with esbuild and moved a second app off Create React App. Total JavaScript shipped fell 55%, from 39.4 MB to 17.6 MB.',
    figure: {
      kind: 'bars',
      from: { value: 39.4, label: '39.4 MB total JavaScript, before' },
      to: { value: 17.6, label: '17.6 MB, after' },
    },
    body: [
      {
        heading: 'Context',
        text: [
          'Every file went through Babel and ts-loader. A second app still ran on Create React App, which keeps its Webpack config out of reach, so there was no clean way to add compression to it.',
        ],
      },
      {
        heading: 'What I did',
        text: [
          'I replaced Babel and ts-loader with esbuild-loader, and moved the second app to a custom Webpack config with Gzip and Brotli compression.',
          'I also owned the upgrade to React 19, Axios 1 and Node 20.',
        ],
      },
      {
        heading: 'Outcome',
        text: ['Total JavaScript shipped across the apps fell 55%, from 39.4 MB to 17.6 MB, and the codebase runs on React 19.'],
      },
    ],
  },
  {
    slug: 'streaming',
    title: 'Millions of records in the browser',
    area: 'Real-time data',
    levels: ['Engineer'],
    result: 'Millions of records',
    stack: ['Server-Sent Events', 'IndexedDB', 'React hooks', 'Client-side pagination'],
    summary:
      'Took a Server-Sent Events proof of concept to production as a reusable useSSE hook that streams millions of security records.',
    figure: { kind: 'stream', caption: 'Diagram: records stream in over SSE, land in IndexedDB, and the view pages a small slice out.' },
    body: [
      {
        heading: 'Context',
        text: [
          'Security telemetry never stops arriving. A proof of concept showed Server-Sent Events could carry it, but it was a one-off, and holding the stream in memory would not survive millions of records.',
        ],
      },
      {
        heading: 'What I did',
        text: [
          'I rebuilt it as a reusable useSSE React hook. Records land in IndexedDB rather than in memory, and the UI pages small slices of 50 to 100 rows out of the store on demand.',
          'So the browser holds the dataset, while the interface only renders what fits on screen. Paging is modular, so responsiveness holds as the data keeps arriving.',
        ],
      },
      {
        heading: 'Outcome',
        text: [
          'The hook streams millions of security records into the console in production. It is reusable: a screen that needs a live feed calls the hook instead of wiring its own stream.',
        ],
      },
    ],
  },
  {
    slug: 'data-table',
    title: 'One table, 66 screens',
    area: 'Design system',
    levels: ['Intern', 'Engineer'],
    result: 'Used on 66 screens',
    stack: ['React', 'TypeScript', 'Memoization', 'Server-side pagination', 'Saved views', 'CSV export'],
    summary: 'Main author of the shared data table used by 66 screens of the console. I wrote 64% of its code.',
    figure: { kind: 'cells', total: 66, filled: 66, unit: 'screen', caption: 'Each cell is one screen of the console that renders the shared table.' },
    body: [
      {
        heading: 'Context',
        text: [
          'Analysts spend their day in tables, so in a security console the table is the product. As an intern I added column ordering and show and hide to the shared table. Over the next three years I became its main author.',
        ],
      },
      {
        heading: 'What I did',
        text: [
          'Columns size themselves from their content, so no developer guesses a width. Analysts reorder, pin, hide and search columns, expand any row for detail, filter and page on the server, export to CSV, and save the whole arrangement as a view that loads next time.',
          'Memoization stopped the whole table re-rendering when a single row is selected.',
        ],
      },
      {
        heading: 'Outcome',
        text: [
          '66 screens use it. I wrote 64% of its code, and four other engineers have adopted it in their own features. The table on this site’s home page borrows its manners.',
        ],
      },
    ],
  },
  {
    slug: 'threat-investigation',
    title: 'Threat investigation',
    area: 'Product',
    levels: ['Engineer'],
    result: '37% of 64K lines',
    stack: ['React', 'TypeScript', 'Process trees', 'Query builder', 'Data visualisation'],
    summary:
      'Led the frontend of the module analysts use to investigate threats: process trees, alert triage and a visual query builder.',
    figure: { kind: 'cells', total: 64, filled: 24, unit: 'thousand lines', caption: '64 cells, one per thousand lines of the module. The filled ones are about my share, 37%.' },
    body: [
      {
        heading: 'Context',
        text: [
          'When an alert fires, an analyst has to work out what ran, what it started and what else it touched, across very large datasets. The threat investigation module is where they do that.',
        ],
      },
      {
        heading: 'What I did',
        text: [
          'Inside a cross-functional team, I led the frontend. I built the interactive process-tree views, the alert triage screens, and a visual query builder that lets analysts search large datasets without writing a query.',
          'I drove the memory work on complex trees, and led incident response when production broke.',
        ],
      },
      {
        heading: 'Outcome',
        text: [
          'I wrote 37% of the module’s 64,000 lines. After a demo to a Gartner analyst, I turned their feedback into shipped product changes.',
        ],
      },
    ],
  },
  {
    slug: 'access',
    title: 'Sign-in, roles and sessions',
    area: 'Security',
    levels: ['Engineer', 'Senior'],
    result: 'TOTP and RBAC',
    stack: ['TOTP', 'RBAC', 'Axios interceptors', 'SonarQube'],
    summary:
      'Two-factor sign-in, role-based navigation and concurrent-session handling, and now the sign-in for an offline edition of the product.',
    figure: {
      kind: 'steps',
      steps: ['Password', 'TOTP code', 'Session', 'Role', 'Navigation'],
      caption: 'The path a sign-in takes, each step something I built.',
    },
    body: [
      {
        heading: 'Context',
        text: ['A security product is judged on its own front door first.'],
      },
      {
        heading: 'What I did',
        text: [
          'I built two-factor authentication with TOTP, role-based access control for navigation, and session handling for concurrent logins in Axios interceptors. I also closed a file-upload validation bypass.',
          'As a senior engineer I am building the sign-in, first-run admin setup and password policy screens for an on-premise, offline edition of the product, and leading the SonarQube code-quality fixes.',
        ],
      },
      {
        heading: 'Outcome',
        text: ['Two-factor sign-in and role-based navigation are in production. The on-premise edition is in progress.'],
      },
    ],
  },
  {
    slug: 'claude-code-workflows',
    title: 'Five Claude Code workflows',
    area: 'Developer tooling',
    levels: ['Senior'],
    result: 'Extended by the team',
    stack: ['Claude Code', 'i18next', 'Git', 'API mocking'],
    summary:
      'Five AI-assisted workflows that open pull requests, translate new UI text into every supported language, mock APIs before the backend exists, build screens on the table component, and turn SVG icons into React components.',
    figure: {
      kind: 'steps',
      steps: ['Pull requests', 'Translations', 'API mocks', 'Table skill', 'SVG to React'],
      caption: 'Five workflows, one for each repetitive job.',
    },
    body: [
      {
        heading: 'Context',
        text: [
          'Five jobs took frontend time without needing frontend judgement: writing up pull requests, adding each new string to every language file, waiting for an endpoint before UI work could start, looking up the table component’s conventions for each new screen, and hand-converting SVG icons into React components.',
        ],
      },
      {
        heading: 'What I did',
        text: [
          'I built five Claude Code workflows. They automate pull request creation, translate new UI text into every supported language, and mock APIs so UI work can start before the backend is ready.',
          'A table skill knows the table component inside out, with every convention for using it, so new screens on it come out right the first time. An icon skill turns SVG icons into React components, a task that used to be done by hand, one icon at a time.',
        ],
      },
      {
        heading: 'Outcome',
        text: ['Teammates use them, and now extend them themselves.'],
      },
    ],
  },
];

export const record = [
  { value: '2,300+', label: 'commits since 2022' },
  { value: '950+', label: 'Jira tickets delivered' },
  { value: '200', label: 'of them High or Critical' },
  { value: '100+', label: 'hotfixes shipped to enterprise customers' },
  { value: '66', label: 'screens on the table I wrote' },
  { value: '2', label: 'SPOT awards' },
];

export const career = [
  {
    role: 'Senior software engineer, frontend',
    when: 'Aug 2026 to now',
    text: 'I lead frontend delivery, scoping work with backend, product and QA, and mentor junior engineers through code reviews and knowledge-transfer sessions. Building the on-premise edition’s sign-in and setup.',
  },
  {
    role: 'Software engineer, frontend',
    when: 'Aug 2023 to Jul 2026',
    text: 'The bundle, the build, streaming, the shared table, threat investigation, sign-in and access. Top contributor to the customer dashboard over the last twelve months of the role.',
  },
  {
    role: 'Software engineer intern, frontend',
    when: 'Jun 2022 to Jul 2023',
    text: 'Network device diagnostics (packet capture, ping and speed tests), a GDPR data-privacy portal, multi-tenant admin portals for telecom carriers, threat detection rule editors and file reputation lookups.',
  },
];

export const about = {
  text: [
    'I like the problems that only show up once something is genuinely large: the point where a pattern that worked fine in a demo stops working, and the fix has to come from understanding what the browser is actually doing.',
    'Most of what I have shipped lives behind a login, used by the same people every day. That is a good discipline: nothing gets to be impressive once and then ignored.',
  ],
  facts: [
    { k: 'Education', v: 'BE Computer Science, Chitkara University, 2019 to 2023. CGPA 9.98 of 10.' },
    { k: 'Recognition', v: 'SPOT award, twice, for the enterprise UI revamp and its frontend performance.' },
    { k: 'Clients', v: 'Represented engineering in Riyadh, leading technical talks with enterprise clients.' },
  ],
};

export const stack = [
  { k: 'Languages', v: ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'SCSS'] },
  { k: 'Frontend', v: ['React 19', 'Hooks', 'Redux Toolkit', 'React Router', 'i18next', 'ECharts', 'Recharts', 'xterm.js', 'react-virtualized', 'Design systems'] },
  { k: 'Build and performance', v: ['Webpack 5', 'Rspack', 'esbuild', 'SWC', 'Babel', 'Code splitting', 'Tree shaking', 'Brotli', 'Core Web Vitals'] },
  { k: 'Browser and APIs', v: ['REST', 'Axios interceptors', 'Server-Sent Events', 'IndexedDB', 'Web Storage', 'TOTP', 'RBAC'] },
  { k: 'Tools', v: ['Git', 'Jira', 'CI/CD', 'Chrome DevTools', 'SonarQube', 'Mirage JS', 'Figma', 'Claude Code'] },
];
