// File tree, file contents, search results, chats

// Helper: simple tokenization for "syntax highlighting"
// Each file has lines; tokens are spans we annotate.
// We pre-build a structure that the renderer can use.

const tok = {
  kw: (s) => ({ t: 'kw', v: s }),
  fn: (s) => ({ t: 'fn', v: s }),
  str: (s) => ({ t: 'str', v: s }),
  num: (s) => ({ t: 'num', v: s }),
  com: (s) => ({ t: 'com', v: s }),
  type: (s) => ({ t: 'type', v: s }),
  prop: (s) => ({ t: 'prop', v: s }),
  p: (s) => ({ t: 'p', v: s }), // plain
};

const FILE_LOGIN = {
  path: 'src/components/auth/LoginForm.tsx',
  language: 'TypeScript',
  size: '4.2 KB',
  lastMod: '2 days ago',
  ext: 'tsx',
  description: 'Email/password sign-in form. Wraps the lower-level <code>AuthCard</code> shell, validates with Zod, and submits via the <code>useSignIn</code> mutation. Renders inline error states inside <code>&lt;FormField&gt;</code> rather than as toasts.',
  keyFunctions: [
    { name: 'LoginForm', kind: 'component', line: 24, desc: 'The form component itself.' },
    { name: 'loginSchema', kind: 'const', line: 14, desc: 'Zod schema for email + password.' },
    { name: 'onSubmit', kind: 'fn', line: 47, desc: 'Calls signIn mutation, routes to /dashboard on success.' },
  ],
  dependencies: [
    'src/hooks/useSignIn.ts',
    'src/components/auth/AuthCard.tsx',
    'src/components/ui/form.tsx',
    'src/lib/zod-schemas.ts',
  ],
  related: [
    'src/components/auth/MagicLinkForm.tsx',
    'src/components/auth/SignupForm.tsx',
    'src/app/(auth)/login/page.tsx',
  ],
  lines: [
    [tok.kw("'use client'"), ],
    [],
    [tok.kw('import'), tok.p(' { useState } '), tok.kw('from'), tok.p(' '), tok.str("'react'")],
    [tok.kw('import'), tok.p(' { useRouter } '), tok.kw('from'), tok.p(' '), tok.str("'next/navigation'")],
    [tok.kw('import'), tok.p(' { z } '), tok.kw('from'), tok.p(' '), tok.str("'zod'")],
    [tok.kw('import'), tok.p(' { zodResolver } '), tok.kw('from'), tok.p(' '), tok.str("'@hookform/resolvers/zod'")],
    [tok.kw('import'), tok.p(' { useForm } '), tok.kw('from'), tok.p(' '), tok.str("'react-hook-form'")],
    [tok.kw('import'), tok.p(' { useSignIn } '), tok.kw('from'), tok.p(' '), tok.str("'@/hooks/useSignIn'")],
    [tok.kw('import'), tok.p(' { AuthCard } '), tok.kw('from'), tok.p(' '), tok.str("'./AuthCard'")],
    [tok.kw('import'), tok.p(' { Button } '), tok.kw('from'), tok.p(' '), tok.str("'@/components/ui/button'")],
    [tok.kw('import'), tok.p(' { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } '), tok.kw('from'), tok.p(' '), tok.str("'@/components/ui/form'")],
    [tok.kw('import'), tok.p(' { Input } '), tok.kw('from'), tok.p(' '), tok.str("'@/components/ui/input'")],
    [],
    [tok.kw('const'), tok.p(' '), tok.fn('loginSchema'), tok.p(' = z.'), tok.fn('object'), tok.p('({')],
    [tok.p('  email: z.'), tok.fn('string'), tok.p('().'), tok.fn('email'), tok.p('('), tok.str("'Enter a valid email'"), tok.p('),')],
    [tok.p('  password: z.'), tok.fn('string'), tok.p('().'), tok.fn('min'), tok.p('('), tok.num('8'), tok.p(', '), tok.str("'Min 8 characters'"), tok.p('),')],
    [tok.p('})')],
    [],
    [tok.kw('type'), tok.p(' '), tok.type('LoginValues'), tok.p(' = z.'), tok.fn('infer'), tok.p('<'), tok.kw('typeof'), tok.p(' loginSchema>')],
    [],
    [tok.com('// Sign-in form rendered inside the auth route group.')],
    [tok.com('// Validation is client-side via Zod; server errors come back')],
    [tok.com('// through the mutation and are pinned to specific fields.')],
    [tok.kw('export'), tok.p(' '), tok.kw('function'), tok.p(' '), tok.fn('LoginForm'), tok.p('() {')],
    [tok.p('  '), tok.kw('const'), tok.p(' router = '), tok.fn('useRouter'), tok.p('()')],
    [tok.p('  '), tok.kw('const'), tok.p(' [serverError, setServerError] = '), tok.fn('useState'), tok.p('<'), tok.type('string'), tok.p(' | '), tok.kw('null'), tok.p('>('), tok.kw('null'), tok.p(')')],
    [tok.p('  '), tok.kw('const'), tok.p(' { '), tok.fn('mutateAsync'), tok.p(': signIn, isPending } = '), tok.fn('useSignIn'), tok.p('()')],
    [],
    [tok.p('  '), tok.kw('const'), tok.p(' form = '), tok.fn('useForm'), tok.p('<'), tok.type('LoginValues'), tok.p('>({')],
    [tok.p('    resolver: '), tok.fn('zodResolver'), tok.p('(loginSchema),')],
    [tok.p('    defaultValues: { email: '), tok.str("''"), tok.p(', password: '), tok.str("''"), tok.p(' },')],
    [tok.p('  })')],
    [],
    [tok.p('  '), tok.kw('async function'), tok.p(' '), tok.fn('onSubmit'), tok.p('(values: '), tok.type('LoginValues'), tok.p(') {')],
    [tok.p('    setServerError('), tok.kw('null'), tok.p(')')],
    [tok.p('    '), tok.kw('try'), tok.p(' {')],
    [tok.p('      '), tok.kw('await'), tok.p(' '), tok.fn('signIn'), tok.p('(values)')],
    [tok.p('      router.'), tok.fn('push'), tok.p('('), tok.str("'/dashboard'"), tok.p(')')],
    [tok.p('    } '), tok.kw('catch'), tok.p(' (err) {')],
    [tok.p('      '), tok.fn('setServerError'), tok.p('('), tok.fn('parseAuthError'), tok.p('(err))')],
    [tok.p('    }')],
    [tok.p('  }')],
    [],
    [tok.p('  '), tok.kw('return'), tok.p(' (')],
    [tok.p('    <'), tok.type('AuthCard'), tok.p(' '), tok.prop('title'), tok.p('='), tok.str('"Welcome back"'), tok.p('>')],
    [tok.p('      <'), tok.type('Form'), tok.p(' {...form}>')],
    [tok.p('        <'), tok.type('form'), tok.p(' '), tok.prop('onSubmit'), tok.p('={form.'), tok.fn('handleSubmit'), tok.p('(onSubmit)}>')],
    [tok.p('          <'), tok.type('FormField'), tok.p(' '), tok.prop('control'), tok.p('={form.control} '), tok.prop('name'), tok.p('='), tok.str('"email"'), tok.p(' />')],
    [tok.p('          <'), tok.type('FormField'), tok.p(' '), tok.prop('control'), tok.p('={form.control} '), tok.prop('name'), tok.p('='), tok.str('"password"'), tok.p(' />')],
    [tok.p('          <'), tok.type('Button'), tok.p(' '), tok.prop('type'), tok.p('='), tok.str('"submit"'), tok.p(' '), tok.prop('loading'), tok.p('={isPending}>Sign in</'), tok.type('Button'), tok.p('>')],
    [tok.p('        </'), tok.type('form'), tok.p('>')],
    [tok.p('      </'), tok.type('Form'), tok.p('>')],
    [tok.p('    </'), tok.type('AuthCard'), tok.p('>')],
    [tok.p('  )')],
    [tok.p('}')],
  ],
  blame: {
    1: { sha: 'a7f4c91', author: 'Maya Chen', when: '2 days ago' },
    14: { sha: '01b3d2f', author: 'Ravi Iyer', when: '1 week ago' },
    24: { sha: '01b3d2f', author: 'Ravi Iyer', when: '1 week ago' },
    34: { sha: 'a7f4c91', author: 'Maya Chen', when: '2 days ago' },
    47: { sha: 'a7f4c91', author: 'Maya Chen', when: '2 days ago' },
  }
};

// File tree (just enough to feel real)
const FILE_TREE = [
  { type: 'dir', name: 'src', open: true, children: [
    { type: 'dir', name: 'app', open: true, children: [
      { type: 'dir', name: '(auth)', open: true, children: [
        { type: 'dir', name: 'login', children: [
          { type: 'file', name: 'page.tsx', ext: 'tsx' },
        ]},
        { type: 'dir', name: 'signup', children: [
          { type: 'file', name: 'page.tsx', ext: 'tsx' },
        ]},
        { type: 'file', name: 'layout.tsx', ext: 'tsx' },
      ]},
      { type: 'dir', name: '(dashboard)', children: [
        { type: 'file', name: 'page.tsx', ext: 'tsx' },
      ]},
      { type: 'file', name: 'layout.tsx', ext: 'tsx' },
      { type: 'file', name: 'page.tsx', ext: 'tsx' },
      { type: 'file', name: 'globals.css', ext: 'css' },
    ]},
    { type: 'dir', name: 'components', open: true, children: [
      { type: 'dir', name: 'auth', open: true, children: [
        { type: 'file', name: 'LoginForm.tsx', ext: 'tsx', active: true, path: 'src/components/auth/LoginForm.tsx' },
        { type: 'file', name: 'SignupForm.tsx', ext: 'tsx' },
        { type: 'file', name: 'MagicLinkForm.tsx', ext: 'tsx' },
        { type: 'file', name: 'AuthCard.tsx', ext: 'tsx' },
      ]},
      { type: 'dir', name: 'dashboard', children: [
        { type: 'file', name: 'LiveMetricChart.tsx', ext: 'tsx' },
        { type: 'file', name: 'StatTile.tsx', ext: 'tsx' },
      ]},
      { type: 'dir', name: 'ui', children: [
        { type: 'file', name: 'button.tsx', ext: 'tsx' },
        { type: 'file', name: 'input.tsx', ext: 'tsx' },
        { type: 'file', name: 'form.tsx', ext: 'tsx' },
        { type: 'file', name: 'dialog.tsx', ext: 'tsx' },
      ]},
    ]},
    { type: 'dir', name: 'hooks', children: [
      { type: 'file', name: 'useSignIn.ts', ext: 'ts' },
      { type: 'file', name: 'useAuth.ts', ext: 'ts' },
      { type: 'file', name: 'useChartAxes.ts', ext: 'ts' },
    ]},
    { type: 'dir', name: 'lib', children: [
      { type: 'file', name: 'api-client.ts', ext: 'ts' },
      { type: 'file', name: 'zod-schemas.ts', ext: 'ts' },
      { type: 'file', name: 'utils.ts', ext: 'ts' },
    ]},
    { type: 'dir', name: 'types', children: [
      { type: 'file', name: 'auth.ts', ext: 'ts' },
      { type: 'file', name: 'api.ts', ext: 'ts' },
    ]},
  ]},
  { type: 'dir', name: 'public', children: [
    { type: 'file', name: 'logo.svg', ext: 'svg' },
    { type: 'file', name: 'favicon.ico', ext: 'ico' },
  ]},
  { type: 'file', name: 'package.json', ext: 'json' },
  { type: 'file', name: 'tsconfig.json', ext: 'json' },
  { type: 'file', name: 'tailwind.config.ts', ext: 'ts' },
  { type: 'file', name: 'next.config.js', ext: 'js' },
  { type: 'file', name: 'README.md', ext: 'md' },
];

// Search results — query like "how does authentication work"
const SEARCH_RESULTS = [
  {
    path: 'src/components/auth/LoginForm.tsx',
    basename: 'LoginForm.tsx',
    relevance: 0.94,
    lines: { start: 24, end: 42 },
    author: 'Maya Chen', sha: 'a7f4c91', when: '2 days ago',
    snippet: [
      [tok.kw('export'), tok.p(' '), tok.kw('function'), tok.p(' '), tok.fn('LoginForm'), tok.p('() {')],
      [tok.p('  '), tok.kw('const'), tok.p(' { '), tok.fn('mutateAsync'), tok.p(': signIn, isPending } = '), tok.fn('useSignIn'), tok.p('()')],
      [tok.p('  '), tok.kw('async function'), tok.p(' '), tok.fn('onSubmit'), tok.p('(values: '), tok.type('LoginValues'), tok.p(') {')],
      [tok.p('    '), tok.kw('await'), tok.p(' '), tok.fn('signIn'), tok.p('(values)')],
      [tok.p('    router.'), tok.fn('push'), tok.p('('), tok.str("'/dashboard'"), tok.p(')')],
      [tok.p('  }')],
    ],
  },
  {
    path: 'src/hooks/useSignIn.ts',
    basename: 'useSignIn.ts',
    relevance: 0.91,
    lines: { start: 8, end: 24 },
    author: 'Ravi Iyer', sha: '01b3d2f', when: '1 week ago',
    snippet: [
      [tok.kw('export'), tok.p(' '), tok.kw('function'), tok.p(' '), tok.fn('useSignIn'), tok.p('() {')],
      [tok.p('  '), tok.kw('return'), tok.p(' '), tok.fn('useMutation'), tok.p('({')],
      [tok.p('    mutationFn: '), tok.kw('async'), tok.p(' (values: '), tok.type('SignInInput'), tok.p(') => {')],
      [tok.p('      '), tok.kw('const'), tok.p(' res = '), tok.kw('await'), tok.p(' '), tok.fn('apiClient'), tok.p('.'), tok.fn('post'), tok.p('('), tok.str("'/auth/sign-in'"), tok.p(', values)')],
      [tok.p('      '), tok.fn('setSession'), tok.p('(res.data.session)')],
      [tok.p('      '), tok.kw('return'), tok.p(' res.data')],
      [tok.p('    },')],
      [tok.p('  })')],
      [tok.p('}')],
    ],
  },
  {
    path: 'src/hooks/useAuth.ts',
    basename: 'useAuth.ts',
    relevance: 0.83,
    lines: { start: 32, end: 48 },
    author: 'Maya Chen', sha: 'a7f4c91', when: '14m ago',
    snippet: [
      [tok.kw('async function'), tok.p(' '), tok.fn('refresh'), tok.p('() {')],
      [tok.p('  '), tok.kw('try'), tok.p(' {')],
      [tok.p('    '), tok.kw('const'), tok.p(' res = '), tok.kw('await'), tok.p(' '), tok.fn('apiClient'), tok.p('.'), tok.fn('post'), tok.p('('), tok.str("'/auth/refresh'"), tok.p(')')],
      [tok.p('    '), tok.fn('setSession'), tok.p('(res.data.session)')],
      [tok.p('  } '), tok.kw('catch'), tok.p(' (err) {')],
      [tok.p('    '), tok.com('// clear refresh token before redirect — prevents replay')],
      [tok.p('    '), tok.fn('clearSession'), tok.p('()')],
      [tok.p('    router.'), tok.fn('push'), tok.p('('), tok.str("'/login'"), tok.p(')')],
      [tok.p('  }')],
      [tok.p('}')],
    ],
  },
  {
    path: 'src/components/auth/MagicLinkForm.tsx',
    basename: 'MagicLinkForm.tsx',
    relevance: 0.79,
    lines: { start: 18, end: 34 },
    author: 'Ravi Iyer', sha: '01b3d2f', when: '1 week ago',
    snippet: [
      [tok.kw('export'), tok.p(' '), tok.kw('function'), tok.p(' '), tok.fn('MagicLinkForm'), tok.p('() {')],
      [tok.p('  '), tok.kw('const'), tok.p(' [step, setStep] = '), tok.fn('useState'), tok.p('<'), tok.str("'email'"), tok.p(' | '), tok.str("'code'"), tok.p('>('), tok.str("'email'"), tok.p(')')],
      [tok.p('  '), tok.kw('async function'), tok.p(' '), tok.fn('requestLink'), tok.p('(email: '), tok.type('string'), tok.p(') {')],
      [tok.p('    '), tok.kw('await'), tok.p(' '), tok.fn('apiClient'), tok.p('.'), tok.fn('post'), tok.p('('), tok.str("'/auth/magic-link'"), tok.p(', { email })')],
      [tok.p('    '), tok.fn('setStep'), tok.p('('), tok.str("'code'"), tok.p(')')],
      [tok.p('  }')],
    ],
  },
  {
    path: 'src/middleware.ts',
    basename: 'middleware.ts',
    relevance: 0.72,
    lines: { start: 6, end: 18 },
    author: 'Jin Park', sha: 'e2d8b03', when: '3 weeks ago',
    snippet: [
      [tok.kw('export function'), tok.p(' '), tok.fn('middleware'), tok.p('(req: '), tok.type('NextRequest'), tok.p(') {')],
      [tok.p('  '), tok.kw('const'), tok.p(' session = req.cookies.'), tok.fn('get'), tok.p('('), tok.str("'session'"), tok.p(')')],
      [tok.p('  '), tok.kw('if'), tok.p(' (!session && '), tok.fn('isProtected'), tok.p('(req.nextUrl.pathname)) {')],
      [tok.p('    '), tok.kw('return'), tok.p(' '), tok.type('NextResponse'), tok.p('.'), tok.fn('redirect'), tok.p('('), tok.kw('new'), tok.p(' '), tok.type('URL'), tok.p('('), tok.str("'/login'"), tok.p(', req.url))')],
      [tok.p('  }')],
      [tok.p('}')],
    ],
  },
];

const CHATS = [
  {
    id: 'c1', title: 'How does authentication work?', group: 'Today',
    preview: 'Walk me through the auth flow…',
    messages: [
      { role: 'user', content: 'Walk me through how authentication works in this codebase. I want to understand the full flow from form submit to protected route.', when: '2:31 PM' },
      {
        role: 'ai',
        when: '2:31 PM',
        content: [
          { type: 'p', text: "Authentication in <code>voyager-web</code> is layered across the client, a thin middleware, and the API. Here's the path a typical sign-in takes:" },
          { type: 'ol', items: [
            "<strong>Form submit</strong> — <code>LoginForm</code> uses <code>react-hook-form</code> + a Zod schema (<code>loginSchema</code>). On submit it calls the <code>useSignIn</code> mutation.",
            "<strong>API call</strong> — <code>useSignIn</code> POSTs to <code>/auth/sign-in</code>, expects back a <code>{ session }</code> payload, and calls <code>setSession()</code> which stores a signed cookie and writes the user into a Zustand store.",
            "<strong>Redirect</strong> — on success the client routes to <code>/dashboard</code> via <code>router.push()</code>.",
            "<strong>Server-side gate</strong> — <code>middleware.ts</code> runs on every request, checks the <code>session</code> cookie, and redirects to <code>/login</code> if the path is protected and the cookie is missing or invalid.",
            "<strong>Refresh</strong> — <code>useAuth.refresh()</code> swaps a short-lived access token for a fresh one on 401. The recent fix (commit <code>a7f4c91</code>) clears the refresh token before redirecting so a stale token can't be replayed.",
          ]},
          { type: 'p', text: "There's also a parallel <strong>magic-link</strong> flow in <code>MagicLinkForm</code> — two-step (email → 6-digit code), hits <code>/auth/magic-link</code> then <code>/auth/magic-link/verify</code>, but otherwise lands at the same <code>setSession()</code>." },
        ],
        sources: [
          { path: 'src/components/auth/LoginForm.tsx', lines: '24–42' },
          { path: 'src/hooks/useSignIn.ts', lines: '8–24' },
          { path: 'src/hooks/useAuth.ts', lines: '32–48' },
          { path: 'src/middleware.ts', lines: '6–18' },
          { path: 'src/components/auth/MagicLinkForm.tsx', lines: '18–34' },
        ],
      },
      { role: 'user', content: 'Where is the session cookie set? Is it HttpOnly?', when: '2:33 PM' },
      {
        role: 'ai', when: '2:33 PM',
        content: [
          { type: 'p', text: "The cookie is set <em>server-side</em>, not by the web client. <code>setSession()</code> on the client only writes to the Zustand store and triggers a refetch of the user query." },
          { type: 'p', text: "On the API side, <code>POST /auth/sign-in</code> in <code>pulse-api</code> attaches the cookie via:" },
          { type: 'code', lang: 'go', code: [
            [tok.fn('http'), tok.p('.'), tok.fn('SetCookie'), tok.p('(w, &'), tok.type('http'), tok.p('.'), tok.type('Cookie'), tok.p('{')],
            [tok.p('  Name:     '), tok.str('"session"'), tok.p(',')],
            [tok.p('  Value:    signed,')],
            [tok.p('  Path:     '), tok.str('"/"'), tok.p(',')],
            [tok.p('  HttpOnly: '), tok.kw('true'), tok.p(',')],
            [tok.p('  Secure:   cfg.IsProduction,')],
            [tok.p('  SameSite: '), tok.type('http'), tok.p('.'), tok.type('SameSiteLaxMode'), tok.p(',')],
            [tok.p('  MaxAge:   '), tok.num('60'), tok.p(' * '), tok.num('60'), tok.p(' * '), tok.num('24'), tok.p(' * '), tok.num('7'), tok.p(',')],
            [tok.p('})')],
          ]},
          { type: 'p', text: "So yes — <code>HttpOnly</code>, <code>Secure</code> in prod, <code>SameSite=Lax</code>, 7-day expiry. The Web client never touches the raw token." },
        ],
        sources: [
          { path: 'pulse-api: internal/auth/handler.go', lines: '52–74' },
        ],
      },
    ],
  },
  { id: 'c2', title: 'Why does the chart rerender on every tick?', group: 'Today', preview: 'I noticed the LiveMetricChart…', messages: [] },
  { id: 'c3', title: 'Add rate limiting to the API client', group: 'Yesterday', preview: 'How would I add a token-bucket…', messages: [] },
  { id: 'c4', title: 'Refactor the chart axes hook', group: 'Yesterday', preview: 'Walk me through useChartAxes…', messages: [] },
  { id: 'c5', title: 'Where is the dark-mode toggle?', group: 'This week', preview: 'Find the theme toggle component', messages: [] },
  { id: 'c6', title: 'Explain the build pipeline', group: 'This week', preview: 'How does the CI workflow run?', messages: [] },
];

const EXAMPLE_QUERIES = [
  'how does authentication work',
  'where do we handle rate limiting',
  'find the chart axis logic',
  'what does middleware.ts do',
  'show me all useEffect hooks with cleanup',
];

window.__MOCK = Object.assign(window.__MOCK || {}, {
  FILE_LOGIN, FILE_TREE, SEARCH_RESULTS, CHATS, EXAMPLE_QUERIES,
});
