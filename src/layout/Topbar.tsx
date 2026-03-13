import { useEffect, useState } from 'react';

export function Topbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'),
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-edge bg-surface px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            placeholder="Buscar por produto, SKU ou categoria..."
            className="h-9 w-full rounded-lg border border-edge-strong bg-surface-input px-3 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/35"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">
            Ctrl + K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label="Alternar tema claro/escuro"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-edge-strong bg-surface-alt text-sm text-heading hover:bg-surface-alt/80"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="flex items-center gap-2 rounded-full border border-edge bg-surface px-3 py-1.5">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 text-[11px] font-semibold text-white">
            L
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-heading">
              Operador
            </span>
            <span className="text-[10px] text-faint">
              Gerenciamento de catálogo
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

