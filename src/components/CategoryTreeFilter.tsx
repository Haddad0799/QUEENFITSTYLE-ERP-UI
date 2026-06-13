import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { buildCategoryTree } from '../lib/category-utils';
import type { Category } from '../types/categories';

type CategoryTreeFilterProps = {
  /** Categorias da árvore (GET /erp/categories/tree). Aceita lista plana ou aninhada. */
  categories: Category[];
  /** Categoria selecionada; `0` significa "todas". */
  value: number;
  onChange: (categoryId: number) => void;
};

/** Achata a árvore em id → nome para resolver o rótulo da seleção atual. */
function flattenNames(nodes: Category[], acc: Map<number, string>) {
  for (const node of nodes) {
    acc.set(node.id, node.name);
    if (node.children?.length) flattenNames(node.children, acc);
  }
  return acc;
}

/**
 * Filtro de categoria hierárquico: exibe categorias-pai em destaque com as
 * subcategorias indentadas abaixo. Selecionar um pai filtra todos os produtos
 * das subcategorias (o backend expande); selecionar uma subcategoria filtra
 * apenas ela.
 */
export function CategoryTreeFilter({
  categories,
  value,
  onChange,
}: CategoryTreeFilterProps) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const namesById = useMemo(
    () => flattenNames(tree, new Map<number, string>()),
    [tree],
  );

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedLabel =
    value && namesById.has(value)
      ? namesById.get(value)!
      : 'Todas as categorias';

  const handleSelect = (categoryId: number) => {
    onChange(categoryId);
    setIsOpen(false);
  };

  const renderNodes = (nodes: Category[], depth: number) =>
    nodes.map((node) => {
      const hasChildren = (node.children?.length ?? 0) > 0;
      const isSelected = node.id === value;
      return (
        <Fragment key={node.id}>
          <button
            type="button"
            onClick={() => handleSelect(node.id)}
            style={{ paddingLeft: 12 + depth * 16 }}
            className={`flex w-full items-center justify-between rounded-lg py-1.5 pr-3 text-left text-xs transition ${
              isSelected
                ? 'bg-brand-soft text-brand'
                : hasChildren
                  ? 'font-semibold text-heading hover:bg-surface-alt'
                  : 'text-body hover:bg-surface-alt hover:text-heading'
            }`}
          >
            <span className="truncate">{node.name}</span>
            {hasChildren && !isSelected && (
              <span className="ml-2 flex-shrink-0 text-[10px] font-normal text-faint">
                grupo
              </span>
            )}
          </button>
          {hasChildren && renderNodes(node.children!, depth + 1)}
        </Fragment>
      );
    });

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-edge-strong bg-surface-input px-3 text-xs text-heading outline-none transition hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/25 sm:h-8 sm:w-auto sm:min-w-[200px]"
      >
        <span className={value ? 'truncate text-heading' : 'truncate text-faint'}>
          {selectedLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-1 max-h-72 w-full min-w-[220px] overflow-auto rounded-xl border border-edge bg-surface p-1 shadow-xl shadow-black/20 sm:w-max">
          <button
            type="button"
            onClick={() => handleSelect(0)}
            className={`flex w-full items-center rounded-lg py-1.5 pl-3 pr-3 text-left text-xs transition ${
              value === 0
                ? 'bg-brand-soft text-brand'
                : 'text-body hover:bg-surface-alt hover:text-heading'
            }`}
          >
            Todas as categorias
          </button>

          {tree.length > 0 && <div className="my-1 h-px bg-edge" />}

          {renderNodes(tree, 0)}
        </div>
      )}
    </div>
  );
}
