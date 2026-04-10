import { NavLink } from 'react-router-dom';

const navItemBase =
  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

const navItemInactive =
  'text-label hover:bg-surface-alt hover:text-heading';

const navItemActive =
  'bg-brand-soft text-brand shadow-sm';

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-edge bg-surface px-4 py-5">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-rose-300 text-white font-bold">
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

      <nav className="flex flex-1 flex-col gap-1 text-sm">
        <span className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          Catálogo
        </span>

        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
          }
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-soft text-brand">
            🛒
          </span>
          Produtos
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
          }
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            🏷️
          </span>
          Categorias
        </NavLink>

        <NavLink
          to="/products/import"
          className={({ isActive }) =>
            `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
          }
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
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
  );
}

