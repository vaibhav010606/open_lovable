import { WebContainer } from '@webcontainer/api';

// Use globalThis so the singleton survives Next.js hot-module-reloads.
// Module-level variables get reset on every HMR cycle which causes
// "Only a single WebContainer instance can be booted" errors.
declare global {
  // eslint-disable-next-line no-var
  var __wcInstance: WebContainer | null;
  // eslint-disable-next-line no-var
  var __wcBootingPromise: Promise<WebContainer> | null;
}
globalThis.__wcInstance ??= null;
globalThis.__wcBootingPromise ??= null;

export async function bootWebContainer() {
  if (globalThis.__wcInstance) return globalThis.__wcInstance;
  if (globalThis.__wcBootingPromise) return globalThis.__wcBootingPromise;

  globalThis.__wcBootingPromise = WebContainer.boot().then(instance => {
    globalThis.__wcInstance = instance;
    return instance;
  });

  return globalThis.__wcBootingPromise;
}

export const starterFiles = {
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'vite-app',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite --host --port 3000',
          build: 'vite build',
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
        },
        devDependencies: {
          vite: '^5.0.0',
          '@vitejs/plugin-react': '^4.0.0',
          typescript: '^5.0.0',
        },
      }, null, 2),
    },
  },
  'vite.config.ts': {
    file: {
      contents: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,
  },
})`,
    },
  },
  'index.html': {
    file: {
      contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: {
                DEFAULT: '#6366f1',
                dark: '#4f46e5',
                light: '#818cf8',
              },
              accent: {
                DEFAULT: '#c084fc',
                glow: '#e879f9',
              },
              surface: {
                DEFAULT: 'rgba(255, 255, 255, 0.05)',
                hover: 'rgba(255, 255, 255, 0.1)',
                bright: 'rgba(255, 255, 255, 0.2)',
              }
            },
            animation: {
              'fade-in': 'fadeIn 0.5s ease-out forwards',
              'slide-up': 'slideUp 0.4s ease-out forwards',
              'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
              fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
              slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            },
            backgroundImage: {
              'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
              'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            }
          },
        },
      }
    </script>
    <style type="text/tailwindcss">
      @layer base {
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { @apply bg-transparent; }
        ::-webkit-scrollbar-thumb { @apply bg-white/10 rounded-full hover:bg-white/20; }
      }
    </style>
  </head>
  <body class="antialiased bg-slate-950 text-slate-200 min-h-screen selection:bg-indigo-500/30">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
  },
  'src/main.tsx': {
    file: {
      contents: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`,
    },
  },
  'src/App.tsx': {
    file: {
      contents: `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-indigo-900/50">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Ready to build
          </h1>
          <p className="text-slate-400 max-w-sm mx-auto text-lg">
            Describe your app in the chat and watch it come to life here.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span>Environment ready</span>
        </div>
      </div>
    </div>
  )
}`,
    },
  },
  'tsconfig.json': {
    file: {
      contents: JSON.stringify({
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
        },
        include: ['src'],
      }, null, 2),
    },
  },
};
