import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../lib/api-client';
import { extractCategories } from '../lib/category-utils';
import type { Category } from '../types/categories';

/* ────────────────────────────── helpers ────────────────────────────── */

/** Build a tree from a flat list: root categories + nested children */
function buildTree(flat: Category[]): Category[] {
  const hasNested = flat.some((c) => c.children && c.children.length > 0);
  if (hasNested) {
    return flat.filter((c) => !c.parentId);
  }

  const map = new Map<number, Category>();
  const roots: Category[] = [];
  for (const cat of flat) {
    map.set(cat.id, { ...cat, children: [] });
  }
  for (const cat of flat) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

const STATUS_CLASSES = {
  active:
    'border-green-200 bg-green-50 text-green-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'border-edge bg-surface-alt text-muted',
} as const;

/* ────────────────────────────── modal types ────────────────────────────── */

type ModalState =
  | { type: 'create-parent' }
  | { type: 'create-sub'; parentId: number; parentName: string }
  | { type: 'rename'; category: Category }
  | { type: 'delete'; category: Category }
  | null;

/* ────────────────────────────── page ────────────────────────────── */

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modal
  const [modal, setModal] = useState<ModalState>(null);
  const [modalName, setModalName] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // action menu
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // expanded parents
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  /* ── data ── */

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<unknown>('/erp/categories');
      setCategories(extractCategories(response));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar categorias.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // auto-expand all parents on first load
  useEffect(() => {
    if (categories.length > 0 && expanded.size === 0) {
      const tree = buildTree(categories);
      setExpanded(new Set(tree.map((c) => c.id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpenId]);

  /* ── tree ── */

  const tree = buildTree(categories);
  const allNames = categories.map((c) => c.name.toLowerCase());

  /* ── actions ── */

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openModal = (state: ModalState) => {
    setModal(state);
    setModalName(state?.type === 'rename' ? state.category.name : '');
    setModalError(null);
    setIsSubmitting(false);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModal(null);
    setModalName('');
    setModalError(null);
  };

  const handleModalSubmit = async () => {
    if (!modal) return;

    /* delete */
    if (modal.type === 'delete') {
      setIsSubmitting(true);
      setModalError(null);
      try {
        await apiClient.delete(`/erp/categories/${modal.category.id}`);
        setModal(null);
        setModalName('');
        setModalError(null);
        await loadCategories();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Erro ao excluir categoria.';
        if (
          msg.includes('CategoryHasAssociatedProducts') ||
          msg.includes('produtos associados')
        ) {
          setModalError(
            'Não é possível excluir: esta categoria possui produtos associados.',
          );
        } else {
          setModalError(msg);
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    /* validation for create / rename */
    const trimmed = modalName.trim();
    if (!trimmed) {
      setModalError('O nome da categoria é obrigatório.');
      return;
    }
    const isDuplicate = allNames.some((n) => {
      if (modal.type === 'rename' && n === modal.category.name.toLowerCase())
        return false;
      return n === trimmed.toLowerCase();
    });
    if (isDuplicate) {
      setModalError('Já existe uma categoria com esse nome.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    try {
      if (modal.type === 'create-parent') {
        await apiClient.post('/erp/categories', { name: trimmed });
      } else if (modal.type === 'create-sub') {
        await apiClient.post('/erp/categories', {
          name: trimmed,
          parentId: modal.parentId,
        });
        setExpanded((prev) => new Set(prev).add(modal.parentId));
      } else if (modal.type === 'rename') {
        await apiClient.patch(`/erp/categories/${modal.category.id}/rename`, {
          name: trimmed,
        });
      }
      setModal(null);
      setModalName('');
      setModalError(null);
      await loadCategories();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Erro ao salvar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (cat: Category) => {
    // Depuração
    console.log('toggleStatus', { id: cat.id, active: cat.active });
    try {
      if (cat.active) {
        await apiClient.patch(`/erp/categories/${cat.id}/deactivate`);
      } else {
        await apiClient.patch(`/erp/categories/${cat.id}/activate`);
      }
      setMenuOpenId(null);
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao alterar status da categoria.',
      );
    }
  };

  /* ── action menu ── */

  const ActionMenu = ({
    cat,
    isParent,
  }: {
    cat: Category;
    isParent: boolean;
  }) => {
    const isOpen = menuOpenId === cat.id;
    const btnRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
    const children = cat.children ?? [];
    const hasChildren = children.length > 0;
    const hasActiveChildren = children.some((c) => c.active);
    const canDelete = isParent ? !hasChildren : true;
    const canDeactivate = isParent ? !hasActiveChildren : true;

    useEffect(() => {
      if (isOpen && btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        setMenuPos({
          top: rect.bottom + window.scrollY + 4,
          left: rect.right + window.scrollX - 180, // align right edge, width ~180px
        });
      }
    }, [isOpen]);

    // Fecha menu ao rolar
    useEffect(() => {
      if (!isOpen) return;
      const close = () => setMenuOpenId(null);
      window.addEventListener('scroll', close, true);
      return () => window.removeEventListener('scroll', close, true);
    }, [isOpen]);

    // Fecha menu ao redimensionar
    useEffect(() => {
      if (!isOpen) return;
      const close = () => setMenuOpenId(null);
      window.addEventListener('resize', close);
      return () => window.removeEventListener('resize', close);
    }, [isOpen]);

    // Fecha menu ao clicar fora
    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        const target = e.target as Node;
        const clickedButton = btnRef.current?.contains(target);
        const clickedMenu = panelRef.current?.contains(target);
        if (!clickedButton && !clickedMenu) {
          setMenuOpenId(null);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    return (
      <span className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpenId(isOpen ? null : cat.id);
          }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted transition hover:bg-surface-alt hover:text-heading"
          title="Ações"
        >
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
          >
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {isOpen && menuPos && createPortal(
          <div
            ref={panelRef}
            style={{ position: 'absolute', top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
            className="min-w-[180px] rounded-xl border border-edge bg-surface py-1 text-xs shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMenuOpenId(null);
                openModal({ type: 'rename', category: cat });
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-body hover:bg-surface-alt hover:text-heading"
            >
              Renomear
            </button>
            {cat.active ? (
              <button
                onClick={async () => {
                  if (canDeactivate) {
                    await toggleStatus(cat);
                  }
                }}
                disabled={!canDeactivate}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left ${
                  canDeactivate
                    ? 'text-body hover:bg-surface-alt hover:text-heading'
                    : 'cursor-not-allowed text-faint'
                }`}
                title={
                  !canDeactivate
                    ? 'Desative as subcategorias antes'
                    : undefined
                }
              >
                Desativar
              </button>
            ) : (
              <button
                onClick={async () => {
                  await toggleStatus(cat);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-body hover:bg-surface-alt hover:text-heading"
              >
                Ativar
              </button>
            )}
            <button
              onClick={() => {
                if (canDelete) {
                  setMenuOpenId(null);
                  openModal({ type: 'delete', category: cat });
                }
              }}
              disabled={!canDelete}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left ${
                canDelete
                  ? 'text-danger hover:bg-danger-soft'
                  : 'cursor-not-allowed text-faint'
              }`}
              title={!canDelete ? 'Remova as subcategorias antes' : undefined}
            >
              Excluir
            </button>
          </div>,
          document.body
        )}
      </span>
    );
  };

  /* ── modal ── */

  const renderModal = () => {
    if (!modal) return null;

    const isDelete = modal.type === 'delete';
    const title = {
      'create-parent': 'Nova categoria',
      'create-sub': 'Nova subcategoria',
      rename: 'Renomear categoria',
      delete: 'Excluir categoria',
    }[modal.type];

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
        onClick={closeModal}
      >
        <div
          className="w-full max-w-sm rounded-xl border border-edge bg-surface p-5 text-xs shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-3 text-sm font-semibold text-heading">{title}</h3>

          {isDelete ? (
            <p className="mb-4 text-[11px] leading-relaxed text-label">
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-heading">
                {modal.category.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
          ) : (
            <>
              {modal.type === 'create-sub' && (
                <p className="mb-2 text-[11px] text-muted">
                  Subcategoria de{' '}
                  <span className="font-medium text-heading">
                    {modal.parentName}
                  </span>
                </p>
              )}
              <input
                autoFocus
                value={modalName}
                onChange={(e) => {
                  setModalName(e.target.value);
                  setModalError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleModalSubmit();
                  if (e.key === 'Escape') closeModal();
                }}
                placeholder="Nome da categoria"
                className="mb-3 h-10 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </>
          )}

          {modalError && (
            <div className="mb-3 rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
              {modalError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={closeModal}
              className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:text-heading disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleModalSubmit}
              className={
                isDelete
                  ? 'inline-flex h-8 items-center rounded-lg border border-danger-edge bg-danger-action px-3 text-[11px] font-semibold text-white shadow hover:bg-danger-action/90 disabled:opacity-50'
                  : 'inline-flex h-8 items-center rounded-lg bg-brand px-3 text-[11px] font-semibold text-on-brand shadow shadow-brand/40 hover:bg-brand-hover disabled:opacity-50'
              }
            >
              {isSubmitting
                ? isDelete
                  ? 'Excluindo...'
                  : 'Salvando...'
                : isDelete
                  ? 'Sim, excluir'
                  : modal.type === 'rename'
                    ? 'Salvar'
                    : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── render ── */

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading sm:text-xl">
            Categorias de produtos
          </h1>
          <p className="text-xs text-muted">
            Estruture o catálogo organizando os produtos em categorias e
            subcategorias.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openModal({ type: 'create-parent' })}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover active:scale-[0.98] sm:h-8"
        >
          <span className="text-base leading-none">＋</span>
          Nova categoria
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-danger-edge bg-danger-soft px-4 py-3 text-xs text-danger">
          Erro: {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-xl border border-edge bg-surface px-4 py-8 text-center text-sm text-muted shadow-sm">
          Carregando categorias…
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && tree.length === 0 && (
        <div className="rounded-xl border border-edge bg-surface px-4 py-8 text-center text-sm text-muted shadow-sm">
          Nenhuma categoria cadastrada.
        </div>
      )}

      {/* Category cards – one per parent */}
      {!isLoading &&
        tree.map((parent) => {
          const isExpanded = expanded.has(parent.id);
          const children = parent.children ?? [];
          const childCount = children.length;

          return (
            <div
              key={parent.id}
              className="overflow-hidden rounded-xl border border-edge bg-surface shadow-sm"
            >
              {/* Parent header */}
              <div
                className="flex cursor-pointer items-center gap-2 px-4 py-3 transition-colors hover:bg-surface-alt"
                onClick={() => toggleExpand(parent.id)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`flex-shrink-0 text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>

                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-heading">
                  {parent.name}
                </span>

                {childCount > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-soft px-1.5 text-[10px] font-semibold text-brand">
                    {childCount}
                  </span>
                )}

                <span
                  className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    parent.active
                      ? STATUS_CLASSES.active
                      : STATUS_CLASSES.inactive
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {parent.active ? 'Ativa' : 'Inativa'}
                </span>

                <div onClick={(e) => e.stopPropagation()}>
                  <ActionMenu cat={parent} isParent />
                </div>
              </div>

              {/* Expanded: subcategories + add button */}
              {isExpanded && (
                <div className="border-t border-edge">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-2 border-b border-edge px-4 py-2.5 pl-10 transition-colors last:border-b-0 hover:bg-surface-alt sm:pl-12"
                    >
                      <span className="inline-flex h-6 w-4 flex-shrink-0 items-center justify-center text-faint">
                        <span className="h-px w-3 bg-current opacity-30" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-body">
                        {child.name}
                      </span>
                      <span
                        className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                          child.active
                            ? STATUS_CLASSES.active
                            : STATUS_CLASSES.inactive
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {child.active ? 'Ativa' : 'Inativa'}
                      </span>
                      <ActionMenu cat={child} isParent={false} />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      openModal({
                        type: 'create-sub',
                        parentId: parent.id,
                        parentName: parent.name,
                      })
                    }
                    className="flex w-full items-center gap-2 border-t border-dashed border-edge px-4 py-2.5 pl-10 text-[11px] font-medium text-brand/70 transition hover:bg-surface-alt hover:text-brand sm:pl-12"
                  >
                    <span className="text-sm leading-none">＋</span>
                    Adicionar subcategoria
                  </button>
                </div>
              )}
            </div>
          );
        })}

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
