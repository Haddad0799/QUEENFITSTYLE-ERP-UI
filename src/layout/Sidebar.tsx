import { NavLink } from 'react-router-dom';

const navItemBase =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200';

const navItemInactive =
  'text-sidebar-text/75 hover:bg-sidebar-hover hover:text-sidebar-text active:scale-[0.98]';

const navItemActive =
  'bg-sidebar-active text-sidebar-on-active shadow-sm';

const iconClass = 'h-[18px] w-[18px] flex-shrink-0';

// Ícones de linha minimalistas (Lucide), herdam a cor do item via currentColor
function ProductsIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
    </svg>
  );
}

function CategoriesIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

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
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="relative mb-8 flex items-center justify-center px-2 pt-1">
          <img
            src="/logo.png"
            alt="QueenFitStyle"
            className="h-20 w-20 object-contain"
          />

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text lg:hidden"
            aria-label="Fechar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <span className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-muted">
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
            <ProductsIcon />
            Produtos
          </NavLink>

          <NavLink
            to="/categories"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
            }
          >
            <CategoriesIcon />
            Categorias
          </NavLink>

          <NavLink
            to="/products/import"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
            }
          >
            <ImportIcon />
            Importação
          </NavLink>

          <span className="mt-4 mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-sidebar-muted">
            Vendas
          </span>

          <NavLink
            to="/orders"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${navItemBase} ${isActive ? navItemActive : navItemInactive}`
            }
          >
            <OrdersIcon />
            Pedidos
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
