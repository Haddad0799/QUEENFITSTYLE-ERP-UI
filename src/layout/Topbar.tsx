import { useEffect, useState } from 'react';

type TopbarProps = {
  onMenuToggle: () => void;
};

export function Topbar({ onMenuToggle }: TopbarProps) {
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
    <header className="flex h-14 items-center justify-between border-b border-edge bg-surface px-3 sm:h-16 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-heading hover:bg-surface-alt lg:hidden"
          aria-label="Abrir menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>

        {/* Search bar */}
        <div className="relative hidden flex-1 sm:block sm:max-w-md">
          <input
            placeholder="Buscar por produto, SKU ou categoria..."
            className="h-9 w-full rounded-xl border border-edge-strong bg-surface-input px-3 pl-9 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden text-[10px] text-faint md:inline">
            Ctrl + K
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label="Alternar tema claro/escuro"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-edge-strong bg-surface-alt text-sm text-heading transition-colors hover:bg-surface-alt/80"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="hidden items-center gap-2 rounded-full border border-edge bg-surface px-3 py-1.5 sm:flex">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 text-[11px] font-semibold text-white">
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

        {/* Compact avatar — mobile only */}
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 text-[11px] font-semibold text-white sm:hidden">
          L
        </span>
      </div>
    </header>
  );
}

