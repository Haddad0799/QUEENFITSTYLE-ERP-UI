type Props = {
  lowStock: boolean;
};

export function StockStatusBadge({ lowStock }: Props) {
  const styles = lowStock
    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/40'
    : 'bg-green-50 text-green-700 border-green-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';

  const dot = lowStock
    ? 'bg-rose-500 dark:bg-rose-300 animate-pulse'
    : 'bg-emerald-500 dark:bg-emerald-300';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {lowStock ? 'Estoque baixo' : 'Normal'}
    </span>
  );
}
