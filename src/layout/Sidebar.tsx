import { NavLink } from 'react-router-dom';

const navItemBase =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200';

const navItemInactive =
  'text-label hover:bg-surface-alt hover:text-heading active:scale-[0.98]';

const navItemActive =
  'bg-brand-soft text-brand shadow-sm';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  // Close sidebar on navigation (mobile)
  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay — mobile only */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-edge bg-surface px-4 py-5 transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-300 text-white font-bold shadow-lg shadow-pink-500/20">
              QF
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-heading">
                QueenFitStyle
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-brand">
                Backoffice
              </span>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-alt hover:text-heading lg:hidden"
            aria-label="Fechar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <span className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            Catálogo
          </span>

          <NavLink
            to="/products"
            end
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
            }
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand text-sm">
              🛒
            </span>
            Produtos
          </NavLink>

          <NavLink
            to="/categories"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
            }
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm dark:bg-blue-500/15 dark:text-blue-400">
              🏷️
            </span>
            Categorias
          </NavLink>

          <NavLink
            to="/products/import"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
            }
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-sm dark:bg-emerald-500/15 dark:text-emerald-400">
              📥
            </span>
            Importação
          </NavLink>
        </nav>

        <div className="mt-4 rounded-xl border border-edge bg-surface-alt p-3 text-xs text-muted">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-label">Ambiente</span>
            <span className="rounded-full bg-brand-soft px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
              Local
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            API em <span className="font-semibold text-heading">localhost</span>{' '}
            porta <span className="font-semibold text-heading">8080</span>.
          </p>
        </div>
      </aside>
    </>
  );
}

