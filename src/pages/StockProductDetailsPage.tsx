import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { stockService } from '../services/stock';
import { useToast } from '../components/toast/ToastProvider';
import {
  StockSkuTable,
  type StockMovementsState,
} from '../components/stock/StockSkuTable';
import { InboundStockDialog } from '../components/stock/InboundStockDialog';
import { RefreshCwIcon } from '../components/icons';
import type { ProductDetailsDTO } from '../types/products';
import type { StockProductDTO, StockSkuDTO } from '../types/stock';

const EMPTY_MOVEMENTS: StockMovementsState = {
  data: null,
  isLoading: false,
  error: null,
};

/**
 * Não há endpoint de estoque por produto, então localizamos o produto na
 * listagem paginada usando o nome como busca. O nome vem do state da
 * navegação (fluxo normal) ou de GET /erp/products/{id} (acesso direto à URL).
 */
async function fetchStockProduct(
  productId: number,
  knownName: string | null,
): Promise<{ product: StockProductDTO; name: string }> {
  let name = knownName;
  if (!name) {
    const details = await apiClient.get<ProductDetailsDTO>(
      `/erp/products/${productId}`,
    );
    name = details.name;
  }
  const response = await stockService.listProducts({
    page: 0,
    size: 50,
    search: name,
  });
  const product = response.items.find((item) => item.productId === productId);
  if (!product) {
    throw new Error('Produto não encontrado no estoque.');
  }
  return { product, name };
}

export function StockProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const stateName =
    (location.state as { productName?: string } | null)?.productName ?? null;
  // Guarda o nome após a primeira carga para os refetches não repetirem
  // a busca em /erp/products/{id}.
  const nameRef = useRef<string | null>(stateName);

  const [product, setProduct] = useState<StockProductDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedSkuId, setExpandedSkuId] = useState<number | null>(null);
  const [movements, setMovements] =
    useState<StockMovementsState>(EMPTY_MOVEMENTS);

  const [inboundTarget, setInboundTarget] = useState<StockSkuDTO | null>(null);
  const [isSubmittingInbound, setIsSubmittingInbound] = useState(false);
  const [inboundError, setInboundError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refetch' = 'initial') => {
      if (!Number.isInteger(productId)) return;
      if (mode === 'initial') setIsLoading(true);
      else setIsRefetching(true);
      setError(null);
      try {
        const { product: next, name } = await fetchStockProduct(
          productId,
          nameRef.current,
        );
        nameRef.current = name;
        setProduct(next);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar o estoque do produto.',
        );
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const loadMovements = useCallback(async (skuId: number) => {
    setMovements({ data: null, isLoading: true, error: null });
    try {
      const response = await stockService.movements(skuId);
      setMovements({ data: response, isLoading: false, error: null });
    } catch (err) {
      setMovements({
        data: null,
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erro ao carregar movimentações.',
      });
    }
  }, []);

  const handleToggleRow = useCallback(
    (sku: StockSkuDTO) => {
      if (expandedSkuId === sku.skuId) {
        setExpandedSkuId(null);
        setMovements(EMPTY_MOVEMENTS);
        return;
      }
      setExpandedSkuId(sku.skuId);
      loadMovements(sku.skuId);
    },
    [expandedSkuId, loadMovements],
  );

  const handleConfirmInbound = async (quantity: number) => {
    if (!inboundTarget) return;
    setIsSubmittingInbound(true);
    setInboundError(null);
    try {
      await stockService.inbound(inboundTarget.skuId, quantity);
      toast.success(
        'Estoque abastecido',
        `Entrada de ${quantity} unidade(s) registrada para o SKU ${inboundTarget.skuCode}.`,
      );
      const skuId = inboundTarget.skuId;
      setInboundTarget(null);
      load('refetch');
      if (expandedSkuId === skuId) {
        loadMovements(skuId);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Tente novamente.';
      setInboundError(message);
      toast.error('Erro ao abastecer estoque', message);
    } finally {
      setIsSubmittingInbound(false);
    }
  };

  if (!id || Number.isNaN(productId)) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-danger">
        ID de produto inválido.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/stock')}
            className="inline-flex h-9 items-center rounded-xl border border-edge-strong bg-surface px-3 text-xs font-medium text-body hover:text-heading active:scale-[0.98]"
          >
            ← Voltar
          </button>
          <div className="flex items-center gap-3">
            {product &&
              (product.primaryImageUrl ? (
                <img
                  src={product.primaryImageUrl}
                  alt={product.productName}
                  className="h-12 w-12 flex-shrink-0 rounded-xl border border-edge object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-edge bg-surface-alt text-[10px] text-faint">
                  sem img
                </div>
              ))}
            <div>
              <h1 className="text-lg font-semibold text-heading sm:text-xl">
                {product
                  ? product.productName
                  : (nameRef.current ?? 'Carregando estoque...')}
              </h1>
              {product && (
                <p className="text-[11px] text-muted">
                  ID #{product.productId} • {product.skus.length} variação(ões)
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRefetching && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
              atualizando…
            </span>
          )}
          <button
            onClick={() => load('refetch')}
            className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface-alt px-3.5 py-2.5 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface active:scale-[0.98]"
          >
            <RefreshCwIcon className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-edge bg-surface p-6 text-sm text-label">
          Carregando estoque do produto...
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-xl border border-danger-edge bg-danger-soft p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {!isLoading && !error && product && (
        <StockSkuTable
          skus={product.skus}
          expandedSkuId={expandedSkuId}
          movements={movements}
          onToggleRow={handleToggleRow}
          onInbound={(sku) => {
            setInboundError(null);
            setInboundTarget(sku);
          }}
        />
      )}

      {inboundTarget && product && (
        <InboundStockDialog
          sku={inboundTarget}
          productName={product.productName}
          isSubmitting={isSubmittingInbound}
          error={inboundError}
          onClose={() => setInboundTarget(null)}
          onConfirm={handleConfirmInbound}
        />
      )}
    </div>
  );
}
