import React from 'react';

interface ProductStatusSectionProps {
  status: 'DRAFT' | 'READY_FOR_SALE' | 'PUBLISHED' | 'INACTIVE' | 'ARCHIVED';
  onPublish: () => void;
  publishSuccess: boolean;
}

const STATUS_LABELS: Record<ProductStatusSectionProps['status'], string> = {
  DRAFT: 'Rascunho',
  READY_FOR_SALE: 'Pronto para venda',
  PUBLISHED: 'Publicado',
  INACTIVE: 'Inativo',
  ARCHIVED: 'Arquivado',
};

const STATUS_BADGE_CLASSES: Record<ProductStatusSectionProps['status'], string> = {
  DRAFT:
    'rounded-full border border-green-200 bg-green-50 text-green-700 dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-100 px-2.5 py-1 text-[11px] font-medium',
  READY_FOR_SALE:
    'rounded-full border border-green-200 bg-green-50 text-green-700 dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-100 px-2.5 py-1 text-[11px] font-medium',
  PUBLISHED:
    'rounded-full border border-green-200 bg-green-50 text-green-700 dark:border-emerald-400/60 dark:bg-emerald-500/10 dark:text-emerald-100 px-2.5 py-1 text-[11px] font-medium',
  INACTIVE:
    'rounded-full border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-900/80 dark:text-gray-400 px-2.5 py-1 text-[11px] font-medium',
  ARCHIVED:
    'rounded-full border border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-600 dark:bg-gray-900/80 dark:text-gray-400 px-2.5 py-1 text-[11px] font-medium',
};

const INFO_BOX_CLASSES =
  'mt-2 flex items-center gap-2 rounded border border-edge bg-surface px-3 py-2 text-xs text-label dark:border-emerald-400/30 dark:bg-emerald-500/5 dark:text-emerald-100';

export const ProductStatusSection: React.FC<ProductStatusSectionProps> = ({
  status,
  onPublish,
  publishSuccess,
}) => {
  const isDraftOrReady = status === 'DRAFT' || status === 'READY_FOR_SALE';
  const isPublished = status === 'PUBLISHED';
  const disabled = !isDraftOrReady;

  return (
    <div className="rounded-xl border border-edge bg-surface p-4 text-sm">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Status do produto
      </h2>
      <p className="mb-3 text-xs text-label">
        Status atual:{' '}
        <span className={STATUS_BADGE_CLASSES[status]}>{STATUS_LABELS[status]}</span>
      </p>
      {isDraftOrReady && publishSuccess && (
        <div className="mb-2 rounded border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700">
          Produto publicado com sucesso!
        </div>
      )}
      <button
        className={`inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:opacity-60 ${disabled ? 'pointer-events-none' : ''}`}
        onClick={disabled ? undefined : onPublish}
        disabled={disabled}
        aria-disabled={disabled}
      >
        Publicar produto
      </button>
      {isPublished && (
        <div className={INFO_BOX_CLASSES}>
          <span role="img" aria-label="info" className="text-base">ℹ️</span>
          <span>
            Este produto está publicado. Alterações nos dados, preços e imagens serão refletidas automaticamente no catálogo público.
          </span>
        </div>
      )}
    </div>
  );
};
