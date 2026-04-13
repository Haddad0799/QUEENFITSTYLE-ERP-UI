import { useEffect, useMemo, useState } from 'react';
import {
  buildCategoryTree,
  getLeafCategoryOptions,
} from '../lib/category-utils';
import type { Category } from '../types/categories';

type CategoryLeafPickerProps = {
  categories: Category[];
  value: number | null;
  onChange: (categoryId: number) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function CategoryLeafPicker({
  categories,
  value,
  onChange,
  placeholder = 'Selecione uma subcategoria',
  disabled = false,
}: CategoryLeafPickerProps) {
  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const leafOptions = useMemo(() => getLeafCategoryOptions(categories), [categories]);
  const sections = useMemo(
    () =>
      tree
        .map((root) => ({
          root,
          options: leafOptions.filter((option) => option.rootId === root.id),
        }))
        .filter((section) => section.options.length > 0),
    [leafOptions, tree],
  );

  const selectedOption =
    leafOptions.find((option) => option.id === value) ?? null;

  const [isOpen, setIsOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState<number | null>(null);
  const [mobileRootId, setMobileRootId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeSection =
    sections.find((section) => section.root.id === activeRootId) ?? sections[0] ?? null;
  const mobileSection =
    sections.find((section) => section.root.id === mobileRootId) ?? null;

  const handleSelect = (categoryId: number) => {
    onChange(categoryId);
    setIsOpen(false);
    setMobileRootId(null);
  };

  const handleOpen = () => {
    const defaultRootId = selectedOption?.rootId ?? sections[0]?.root.id ?? null;
    setActiveRootId(defaultRootId);
    setMobileRootId(sections.length === 1 ? defaultRootId : null);
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-edge-strong bg-surface-input px-3 py-2 text-left text-sm text-heading outline-none transition hover:border-brand/50 focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-9 sm:text-xs"
      >
        <div className="min-w-0">
          <div
            className={
              selectedOption
                ? 'truncate text-heading'
                : 'truncate text-faint'
            }
          >
            {selectedOption?.label ?? placeholder}
          </div>
          <div className="mt-0.5 text-[10px] text-muted">
            Escolha a categoria pai e depois a subcategoria final.
          </div>
        </div>

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
          className="flex-shrink-0 text-muted"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 px-0 sm:items-center sm:px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl border border-edge bg-surface p-4 text-xs shadow-2xl shadow-black/70 sm:max-w-3xl sm:rounded-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-heading">
                  Escolher subcategoria
                </h3>
                <p className="mt-1 text-[11px] text-muted">
                  Categorias-pai servem para organizar. O produto sempre deve ser
                  vinculado a uma subcategoria final.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-surface-alt hover:text-heading"
                aria-label="Fechar seletor de categoria"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="rounded-xl border border-edge bg-surface-alt px-4 py-6 text-center text-[11px] text-muted">
                Nenhuma subcategoria disponivel para selecao.
              </div>
            ) : (
              <>
                <div className="hidden gap-4 sm:grid sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                  <div className="rounded-xl border border-edge bg-surface-alt p-2">
                    <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Categorias
                    </div>

                    <div className="space-y-1">
                      {sections.map((section) => {
                        const isActive = section.root.id === activeSection?.root.id;

                        return (
                          <button
                            key={section.root.id}
                            type="button"
                            onClick={() => setActiveRootId(section.root.id)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                              isActive
                                ? 'bg-brand-soft text-brand'
                                : 'text-body hover:bg-surface hover:text-heading'
                            }`}
                          >
                            <span className="truncate font-medium">
                              {section.root.name}
                            </span>
                            <span className="ml-3 rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">
                              {section.options.length}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-edge bg-surface-alt p-2">
                    <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                      Subcategorias
                    </div>

                    <div className="space-y-1">
                      {activeSection?.options.map((option) => {
                        const isSelected = option.id === selectedOption?.id;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(option.id)}
                            className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                              isSelected
                                ? 'border-brand bg-brand-soft text-brand'
                                : 'border-transparent bg-surface text-body hover:border-edge-strong hover:text-heading'
                            }`}
                          >
                            <div className="font-medium">{option.shortLabel}</div>
                            <div className="mt-0.5 text-[10px] text-muted">
                              {option.path}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="sm:hidden">
                  {mobileRootId === null ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Categorias
                      </div>

                      {sections.map((section) => (
                        <button
                          key={section.root.id}
                          type="button"
                          onClick={() => setMobileRootId(section.root.id)}
                          className="flex w-full items-center justify-between rounded-xl border border-edge bg-surface-alt px-3 py-3 text-left transition hover:border-edge-strong hover:bg-surface"
                        >
                          <div>
                            <div className="font-medium text-heading">
                              {section.root.name}
                            </div>
                            <div className="mt-0.5 text-[10px] text-muted">
                              {section.options.length} subcategoria(s)
                            </div>
                          </div>

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
                            className="flex-shrink-0 text-muted"
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setMobileRootId(null)}
                        className="inline-flex items-center gap-2 rounded-lg text-[11px] font-medium text-body transition hover:text-heading"
                      >
                        <span className="text-base leading-none">&#8249;</span>
                        Voltar para categorias
                      </button>

                      <div className="rounded-xl border border-edge bg-surface-alt p-2">
                        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                          {mobileSection?.root.name}
                        </div>

                        <div className="space-y-1">
                          {mobileSection?.options.map((option) => {
                            const isSelected = option.id === selectedOption?.id;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                                  isSelected
                                    ? 'border-brand bg-brand-soft text-brand'
                                    : 'border-transparent bg-surface text-body hover:border-edge-strong hover:text-heading'
                                }`}
                              >
                                <div className="font-medium">
                                  {option.shortLabel}
                                </div>
                                <div className="mt-0.5 text-[10px] text-muted">
                                  {option.path}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
