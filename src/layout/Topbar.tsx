import { useEffect, useState } from 'react';
import { UserMenu } from '../components/auth/UserMenu';
import { MoonIcon, SunIcon } from '../components/icons';

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
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          aria-label="Alternar tema claro/escuro"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-edge-strong bg-surface-alt text-sm text-heading transition-colors hover:bg-surface-alt/80"
        >
          {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
