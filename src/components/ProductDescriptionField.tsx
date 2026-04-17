import { useState } from 'react';
import { apiClient } from '../lib/api-client';

export type ProductAIDescriptionRequest = {
  productName: string;
  categoryName?: string;
  subcategoryName?: string;
  brand?: string;
  material?: string;
  color?: string;
  fit?: string;
  targetAudience?: string;
  highlights?: string[];
  additionalDetails?: string;
};

type GenerateDescriptionResponse = {
  description: string;
};

type ProductDescriptionFieldProps = {
  description: string;
  onDescriptionChange: (value: string) => void;
  productData: ProductAIDescriptionRequest;
  label?: string;
  placeholder?: string;
  rows?: number;
  hideTextarea?: boolean;
};

const trimValue = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const buildRequestBody = (
  productData: ProductAIDescriptionRequest,
): ProductAIDescriptionRequest => ({
  productName: productData.productName.trim(),
  categoryName: trimValue(productData.categoryName),
  subcategoryName: trimValue(productData.subcategoryName),
  brand: trimValue(productData.brand),
  material: trimValue(productData.material),
  color: trimValue(productData.color),
  fit: trimValue(productData.fit),
  targetAudience: trimValue(productData.targetAudience),
  highlights: productData.highlights
    ?.map((highlight) => highlight.trim())
    .filter(Boolean),
  additionalDetails: trimValue(productData.additionalDetails),
});

export function ProductDescriptionField({
  description,
  onDescriptionChange,
  productData,
  label = 'Descrição',
  placeholder = 'Fale sobre tecido, modelagem, tecnologia (dry fit, compressão, UV), etc.',
  rows = 4,
  hideTextarea = false,
}: ProductDescriptionFieldProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleGenerateDescription = async () => {
    if (!productData.productName.trim()) {
      setGenerationError('Informe o nome do produto antes de gerar a descrição.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await apiClient.post<GenerateDescriptionResponse>(
        '/erp/products/ai/generate-description',
        buildRequestBody(productData),
      );

      onDescriptionChange(response.description ?? '');
    } catch (err) {
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'Erro ao gerar descrição com IA.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[11px] font-medium text-label">{label}</label>
        <button
          type="button"
          onClick={handleGenerateDescription}
          disabled={isGenerating}
          className="inline-flex h-8 items-center justify-center rounded-xl border border-edge-strong bg-surface px-3 text-[11px] font-medium text-body transition hover:text-heading active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? 'Gerando...' : 'Gerar descrição com IA'}
        </button>
      </div>

      {!hideTextarea && (
        <textarea
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-xl border border-edge-strong bg-surface-input px-3 py-2.5 text-sm text-heading outline-none placeholder:text-faint focus:border-brand focus:ring-2 focus:ring-brand/25 sm:text-xs"
        />
      )}

      {generationError && (
        <div className="rounded-xl border border-danger-edge bg-danger-soft px-3 py-2.5 text-[11px] text-danger">
          {generationError}
        </div>
      )}
    </div>
  );
}
