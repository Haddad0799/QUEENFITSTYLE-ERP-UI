import type { StockColorDTO } from '../../types/stock';
import { StockStatusBadge } from './StockStatusBadge';
import { InboxIcon } from '../icons';

type Props = {
  colors: StockColorDTO[];
  selectedColorId: number | null;
  onSelect: (color: StockColorDTO) => void;
};

/** Círculo da cor; cai para um neutro pontilhado quando não há hex cadastrado. */
const ColorSwatch = ({ hex }: { hex: string | null }) =>
  hex ? (
    <span
      className="h-5 w-5 flex-shrink-0 rounded-full border border-edge shadow-inner"
      style={{ backgroundColor: hex }}
    />
  ) : (
    <span className="h-5 w-5 flex-shrink-0 rounded-full border border-dashed border-edge-strong bg-surface-alt" />
  );

export function StockColorList({ colors, selectedColorId, onSelect }: Props) {
  if (colors.length === 0) {
    return (
      <div className="rounded-xl border border-edge bg-surface px-4 py-10 text-center shadow-sm">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-alt text-faint">
            <InboxIcon className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium text-heading">
            Nenhuma cor encontrada
          </span>
          <span className="text-[11px] text-faint">
            Este produto ainda não possui variações com estoque.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {colors.map((color) => {
        const isSelected = selectedColorId === color.colorId;
        return (
          <button
            key={color.colorId}
            type="button"
            onClick={() => onSelect(color)}
            className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 text-left shadow-sm transition active:scale-[0.99] ${
              isSelected
                ? 'border-brand ring-2 ring-brand/25'
                : 'border-edge hover:border-brand/50 hover:bg-surface-alt'
            }`}
          >
            <ColorSwatch hex={color.colorHex} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-heading">
                {color.colorName}
              </span>
              <span className="text-[11px] text-muted">
                Disponível:{' '}
                <span className="font-semibold text-heading">
                  {color.totalAvailable}
                </span>
              </span>
            </div>
            <StockStatusBadge lowStock={color.hasLowStock} />
          </button>
        );
      })}
    </div>
  );
}
