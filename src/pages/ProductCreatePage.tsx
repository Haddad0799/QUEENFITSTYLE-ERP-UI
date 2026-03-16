import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import type { CategoriesDetailsDTO, Category } from '../types/categories';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiClient.get<CategoriesDetailsDTO>(
          '/erp/categories',
        );
        setCategories(response.categorias ?? []);
      } catch {
        // falha silenciosa por enquanto
      }
    };

    loadCategories();
  }, []);

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-2.5 text-xs font-medium text-body hover:border-edge-strong hover:text-heading"
          >
            ← Voltar
          </button>
          <div>
            <h1 className="text-xl font-semibold text-heading">
              Novo produto
            </h1>
            <p className="text-xs text-muted">
              Cadastre um produto base. A criação dos SKUs e imagens ocorre em
              etapas posteriores.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-xl border border-edge bg-surface p-4 text-xs md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-label">
              Nome do produto
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camiseta Dry Fit, Legging Cintura Alta..."
              className="h-9 w-full rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/35"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-label">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Fale sobre tecido, modelagem, tecnologia (dry fit, compressão, UV), etc."
              className="w-full rounded-lg border border-edge-strong bg-surface-input px-2.5 py-2 text-xs text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/35"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-label">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-9 w-full rounded-lg border border-edge-strong bg-surface-input px-2.5 text-xs text-heading outline-none focus:border-brand focus:ring-2 focus:ring-brand/35"
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-lg border border-danger-edge bg-danger-soft px-3 py-2 text-[11px] text-danger">
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-8 items-center rounded-lg border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body hover:border-edge-strong hover:text-heading"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-8 items-center rounded-lg bg-brand px-3.5 text-[11px] font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Salvando...' : 'Criar produto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

