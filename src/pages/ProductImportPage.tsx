import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { downloadImportTemplate } from '../lib/generate-import-template';
import type {
  ImportProductResult,
  ImportProductStatus,
  ImportResult,
} from '../types/import';

export function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = '.xlsx';
  const acceptMime =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const validateFile = (selectedFile: File): boolean => {
    if (!selectedFile.name.endsWith('.xlsx') && selectedFile.type !== acceptMime) {
      setError('Formato inválido. Envie apenas arquivos .xlsx (Excel).');
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0];

    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.postMultipart<ImportResult>(
        '/erp/products/import',
        formData,
      );

      setResult(response);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'Erro ao importar planilha.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const hasErrors = Boolean(result && result.errors.length > 0);
  const productResults = result?.products ?? [];
  const hasProductDetails = productResults.length > 0;
  const summary = result ? buildImportSummary(result) : null;

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div>
        <Link
          to="/products"
          className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          ← Voltar para Produtos
        </Link>
        <h1 className="text-lg font-semibold text-heading sm:text-xl">
          Importar Produtos via Planilha
        </h1>
        <p className="text-xs text-muted">
          Faça upload de uma planilha .xlsx para criar produtos e SKUs em lote.
        </p>
      </div>

      <div className="rounded-xl border border-edge bg-surface p-5">
        <div className="mb-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-heading">
            <span>📄</span> Como usar
          </h2>
          <ol className="list-inside list-decimal space-y-1 text-xs leading-relaxed text-muted">
            <li>Baixe o template</li>
            <li>Preencha os dados dos produtos e SKUs</li>
            <li>Faça o upload da planilha preenchida</li>
          </ol>
        </div>

        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span>⚠️</span> Atenção
          </h3>
          <ul className="list-inside list-disc space-y-1 text-xs text-amber-700 dark:text-amber-300">
            <li>Utilize o template fornecido (estrutura obrigatória)</li>
            <li>A categoria deve já existir no sistema</li>
            <li>Cada linha representa um SKU (cor + tamanho)</li>
          </ul>
        </div>

        <div className="mb-4 rounded-lg border border-edge bg-surface-alt p-3">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-label">
            <span>⚙️</span> O sistema faz automaticamente
          </h3>
          <ul className="list-inside list-disc space-y-1 text-xs text-muted">
            <li>Agrupa SKUs no mesmo produto (nome + categoria)</li>
            <li>Atualiza produtos já existentes</li>
            <li>Ignora SKUs duplicados</li>
            <li>Padroniza códigos automaticamente</li>
            <li>Evita duplicação ao importar novamente</li>
          </ul>
        </div>

        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
            <span>❗</span> Em caso de erro
          </h3>
          <ul className="list-inside list-disc space-y-1 text-xs text-red-700 dark:text-red-300">
            <li>Produtos com erro não serão importados</li>
            <li>SKUs com erro não afetam os demais</li>
          </ul>
        </div>

        <div className="flex flex-col items-start gap-3 rounded-xl border border-edge bg-surface-alt p-3 sm:flex-row sm:items-center">
          <span className="text-xl">📥</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-heading">Template</p>
          </div>
          <button
            onClick={downloadImportTemplate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-3.5 py-2.5 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover active:scale-[0.98] sm:w-auto"
          >
            Baixar Template (.xlsx)
          </button>
        </div>
      </div>

      {!result && (
        <div className="rounded-xl border border-edge bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-heading">
            Enviar planilha
          </h2>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition ${
              isDragging
                ? 'border-brand bg-brand-soft/30'
                : 'border-edge bg-surface-alt hover:border-brand/40'
            }`}
          >
            <span className="text-3xl">📄</span>
            {file ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-heading">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="rounded-md px-1.5 py-0.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Remover
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-heading">
                  Arraste o arquivo aqui ou clique para selecionar
                </p>
                <p className="text-[11px] text-muted">
                  Apenas arquivos .xlsx (Excel)
                </p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-brand/30 border-t-on-brand" />
                Processando...
              </>
            ) : (
              <>
                <span className="text-base leading-none">📤</span>
                Importar
              </>
            )}
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-edge bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-heading">
            Resultado da importação
          </h2>

          {summary && (
            <div
              className={`mb-5 rounded-xl border px-4 py-3 ${
                summary.tone === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : summary.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300'
              }`}
            >
              <p className="text-sm font-semibold">{summary.title}</p>
              <p className="mt-1 text-xs leading-relaxed">{summary.description}</p>
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <MetricCard
              label="Total de linhas"
              value={result.totalRows}
              color="gray"
            />
            <MetricCard
              label="Linhas válidas"
              value={result.validRows}
              color="gray"
            />
            <MetricCard
              label="Produtos criados"
              value={result.productsCreated}
              color="green"
            />
            <MetricCard
              label="Produtos reutilizados"
              value={result.productsReused}
              color="blue"
            />
            <MetricCard
              label="SKUs criados"
              value={result.skusCreated}
              color="green"
            />
            <MetricCard
              label="SKUs ignorados"
              value={result.skusIgnored}
              color="yellow"
            />
            <MetricCard
              label="SKUs com falha"
              value={result.skusFailed}
              color="red"
            />
          </div>

          {hasProductDetails && (
            <div className="mb-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-heading">
                  Detalhamento por produto
                </h3>
                <span className="text-xs text-muted">
                  {productResults.length} produto(s) processado(s)
                </span>
              </div>

              <div className="space-y-3">
                {productResults.map((product) => (
                  <ProductResultCard
                    key={`${product.slug}-${product.category}`}
                    product={product}
                  />
                ))}
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">
                Erros gerais da importação ({result.errors.length})
              </h3>
              <div className="max-h-72 overflow-auto rounded-lg border border-red-200 dark:border-red-500/30">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-red-200 bg-red-50 text-left text-[11px] font-semibold uppercase tracking-wider text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                      <th className="px-3 py-2">Linha</th>
                      <th className="px-3 py-2">Produto</th>
                      <th className="px-3 py-2">Categoria</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Erro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 dark:divide-red-500/20">
                    {result.errors.map((importError, index) => (
                      <tr
                        key={index}
                        className="bg-red-50/50 text-red-700 dark:bg-red-500/5 dark:text-red-300"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-mono">
                          {importError.rowNumber}
                        </td>
                        <td className="px-3 py-2">{importError.productName}</td>
                        <td className="px-3 py-2">{importError.category}</td>
                        <td className="px-3 py-2 font-mono">
                          {importError.skuCode}
                        </td>
                        <td className="px-3 py-2">
                          {importError.field && (
                            <span className="mr-1 font-semibold">
                              [{importError.field}]
                            </span>
                          )}
                          {importError.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <button
              onClick={handleReset}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-edge bg-surface-alt px-3.5 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface active:scale-[0.98] sm:h-auto sm:py-2"
            >
              <span className="text-base leading-none">📤</span>
              Importar outro arquivo
            </button>
            <Link
              to="/products"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-3.5 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover active:scale-[0.98] sm:h-auto sm:py-2"
            >
              Ver produtos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

type MetricColor = 'gray' | 'green' | 'blue' | 'yellow' | 'red';

const COLOR_MAP: Record<MetricColor, string> = {
  gray: 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300',
  green:
    'border-green-200 bg-green-50 text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  yellow:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
  red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
};

const PRODUCT_STATUS_LABELS: Record<ImportProductStatus, string> = {
  CREATED: 'Produto criado',
  REUSED: 'Produto reutilizado',
  FAILED: 'Produto com falha',
};

const PRODUCT_STATUS_COLOR_MAP: Record<ImportProductStatus, string> = {
  CREATED:
    'border-green-200 bg-green-50 text-green-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
  REUSED:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
  FAILED:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300',
};

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: MetricColor;
}) {
  return (
    <div className={`rounded-xl border p-3 ${COLOR_MAP[color]}`}>
      <p className="text-[11px] font-medium opacity-70">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function DetailStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: MetricColor;
}) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${COLOR_MAP[color]}`}>
      <p className="text-[11px] font-medium opacity-70">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function ProductResultCard({ product }: { product: ImportProductResult }) {
  return (
    <div className="rounded-xl border border-edge bg-surface-alt p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-heading">
            {product.productName}
          </p>
          <p className="mt-1 text-xs text-muted">
            {product.category} • {product.totalRows} linha(s)
          </p>
        </div>
        <span
          className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${PRODUCT_STATUS_COLOR_MAP[product.productStatus]}`}
        >
          {PRODUCT_STATUS_LABELS[product.productStatus]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DetailStat label="Linhas" value={product.totalRows} color="gray" />
        <DetailStat
          label="SKUs criados"
          value={product.skusCreated}
          color="green"
        />
        <DetailStat
          label="SKUs ignorados"
          value={product.skusIgnored}
          color="yellow"
        />
        <DetailStat
          label="SKUs com falha"
          value={product.skusFailed}
          color="red"
        />
      </div>

      {product.errors.length > 0 && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="mb-2 text-xs font-semibold text-red-700 dark:text-red-300">
            Ocorrências neste produto
          </p>
          <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
            {product.errors.map((productError, index) => (
              <li key={`${product.slug}-error-${index}`}>
                {formatProductError(productError)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function buildImportSummary(result: ImportResult): {
  title: string;
  description: string;
  tone: 'success' | 'warning' | 'info';
} {
  if (result.errors.length > 0 || result.skusFailed > 0) {
    return {
      title: 'Importação concluída com pendências',
      description: `O arquivo foi processado com ${result.totalRows} linha(s), mas houve ${result.skusFailed} SKU(s) com falha e ${result.errors.length} erro(s) geral(is) para revisão.`,
      tone: 'warning',
    };
  }

  if (
    result.skusCreated === 0 &&
    result.skusIgnored > 0 &&
    result.productsReused > 0
  ) {
    return {
      title: 'Nenhum SKU novo foi criado',
      description: `Os ${result.productsReused} produto(s) já existiam e ${result.skusIgnored} SKU(s) foram ignorados, provavelmente por já estarem cadastrados.`,
      tone: 'info',
    };
  }

  return {
    title: 'Importação concluída com sucesso',
    description: `Foram processadas ${result.validRows} linha(s) válida(s), com ${result.productsCreated} produto(s) criado(s) e ${result.skusCreated} SKU(s) novo(s).`,
    tone: 'success',
  };
}

function formatProductError(
  error: ImportProductResult['errors'][number],
): string {
  if (typeof error === 'string') {
    return error;
  }

  const details = [
    error.rowNumber ? `Linha ${error.rowNumber}` : null,
    error.skuCode ? `SKU ${error.skuCode}` : null,
    error.field ? `campo ${error.field}` : null,
  ].filter(Boolean);

  if (details.length === 0) {
    return error.message;
  }

  return `${details.join(', ')}: ${error.message}`;
}
