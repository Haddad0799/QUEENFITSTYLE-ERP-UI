import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ChangePasswordDialog } from './ChangePasswordDialog';

export function UserMenu() {
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full border border-edge bg-surface px-2 py-1 transition hover:border-edge-strong sm:px-3 sm:py-1.5"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-300 text-[11px] font-semibold text-white">
            L
          </span>
          <div className="hidden flex-col text-left sm:flex">
            <span className="text-xs font-medium text-heading">Operador</span>
            <span className="text-[10px] text-faint">Gerenciamento de catálogo</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`hidden text-muted transition-transform sm:block ${
              open ? 'rotate-180' : ''
            }`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-edge bg-surface py-1 shadow-xl shadow-black/10"
          >
            <div className="border-b border-edge px-3 py-2.5">
              <div className="text-xs font-medium text-heading">Operador</div>
              <div className="text-[10px] text-faint">
                Sessão autenticada
              </div>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setShowChangePassword(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-medium text-heading transition hover:bg-surface-alt"
            >
              <span className="text-sm leading-none">🔒</span>
              Alterar senha
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] font-medium text-danger transition hover:bg-danger-soft"
            >
              <span className="text-sm leading-none">↩</span>
              Sair
            </button>
          </div>
        )}
      </div>

      <ChangePasswordDialog
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
}
