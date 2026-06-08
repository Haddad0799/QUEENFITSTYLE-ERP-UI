import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryLeafPicker } from '../components/CategoryLeafPicker';
import {
  ProductDescriptionField,
  type ProductAIDescriptionRequest,
} from '../components/ProductDescriptionField';
import { apiClient } from '../lib/api-client';
import {
  extractCategories,
  getLeafCategoryOptions,
} from '../lib/category-utils';
import type { Category } from '../types/categories';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [launch, setLaunch] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.get<unknown>('/erp/categories');
        setCategories(extractCategories(response));
      } catch {
        // falha silenciosa por enquanto
      }
    };

    loadCategories();
  }, []);

  const selectedCategory = useMemo(
    () =>
      categoryId
        ? getLeafCategoryOptions(categories).find(
            (category) => category.id === Number(categoryId),
          )
        : undefined,
    [categories, categoryId],
  );

  /**
   * Brand fixo garante que o backend sempre receba ao menos um atributo
   * extra além de nome e categoria — atende a regra de validação do
   * endpoint /erp/products/ai/generate-description.
   */
  const descriptionProductData: ProductAIDescriptionRequest = {
    productName: name,
    categoryName: selectedCategory?.rootName,
    subcategoryName: selectedCategory?.name,
    brand: 'QueenFitStyle',
    additionalDetails: description,
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !categoryId) return;

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/erp/products', {
        name: name.trim(),
        description: description.trim() || null,
        categoryId: Number(categoryId),
        isLaunch: launch,
      });

      navigate('/products');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao criar produto.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-9 items-center rounded-xl border border-edge-strong bg-surface px-3 text-xs font-medium text-body hover:text-heading active:scale-[0.98]"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-lg font-semibold text-heading sm:text-xl">
              Novo produto
            </h1>
            <p className="text-xs text-muted">
              Cadastre um produto base. SKUs e imagens são adicionados depois.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-edge bg-surface p-4 text-xs md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] md:gap-6"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-label">
              Nome do produto
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camiseta Dry Fit, Legging Cintura Alta..."
              className="h-11 w-full rounded-xl border border-edge-strong bg-surface-input px-3 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 sm:h-9 sm:text-xs"
            />
          </div>

          <ProductDescriptionField
            description={description}
            onDescriptionChange={setDescription}
            productData={descriptionProductData}
            label="Ajuda da IA"
            hideTextarea
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-label">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Fale sobre tecido, modelagem, tecnologia (dry fit, compressão, UV), etc."
              className="w-full rounded-xl border border-edge-strong bg-surface-input px-3 py-2.5 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 sm:text-xs"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-edge bg-surface-alt px-3 py-3 transition hover:border-brand/40">
            <input
              type="checkbox"
              checked={launch}
              onChange={(e) => setLaunch(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border border-edge-strong text-brand focus:ring-brand/30"
            />
            <span className="space-y-1">
              <span className="block text-[11px] font-medium text-label">
                Marcar como lançamento
              </span>
              <span className="block text-[11px] text-muted">
                Publica o produto no ecommerce com destaque de lançamento.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-label">
              Categoria
            </label>
            <CategoryLeafPicker
              categories={categories}
              value={categoryId ? Number(categoryId) : null}
              onChange={(selectedCategoryId) =>
                setCategoryId(String(selectedCategoryId))
              }
            />
            <p className="text-[11px] text-muted">
              O produto deve ser vinculado a uma categoria final, como{' '}
              <span className="font-medium text-heading">Roupas / Leggings</span>.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-danger-edge bg-danger-soft px-3 py-2.5 text-[11px] text-danger">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-edge-strong bg-surface px-4 text-xs font-medium text-body hover:text-heading active:scale-[0.98] sm:h-8"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !categoryId}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-4 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-8"
            >
              {isLoading ? 'Salvando...' : 'Criar produto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
