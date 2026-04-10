import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api-client';
import { downloadImportTemplate } from '../lib/generate-import-template';
import type { ImportResult } from '../types/import';

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

  const validateFile = (f: File): boolean => {
    if (!f.name.endsWith('.xlsx') && f.type !== acceptMime) {
      setError('Formato inválido. Envie apenas arquivos .xlsx (Excel).');
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (selected && validateFile(selected)) {
      setFile(selected);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) {
      setFile(dropped);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.postMultipart<ImportResult>(
        '/erp/products/import',
        formData,
      );
      setResult(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao importar planilha.',
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasErrors = result && result.errors.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            to="/products"
            className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            ← Voltar para Produtos
          </Link>
          <h1 className="text-xl font-semibold text-heading">
            Importar Produtos via Planilha
          </h1>
          <p className="text-xs text-muted">
            Faça upload de uma planilha .xlsx para criar produtos e SKUs em
            lote.
          </p>
        </div>
      </div>

      {/* Section A — Instructions & Template */}
      <div className="rounded-xl border border-edge bg-surface p-5">
        {/* Como usar */}
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

        {/* Atenção */}
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

        {/* O sistema faz automaticamente */}
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

        {/* Em caso de erro */}
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-300">
            <span>❗</span> Em caso de erro
          </h3>
          <ul className="list-inside list-disc space-y-1 text-xs text-red-700 dark:text-red-300">
            <li>Produtos com erro não serão importados</li>
            <li>SKUs com erro não afetam os demais</li>
          </ul>
        </div>

        {/* Template download */}
        <div className="flex items-center gap-3 rounded-lg border border-edge bg-surface-alt p-3">
          <span className="text-xl">📥</span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-heading">Template</p>
          </div>
          <button
            onClick={downloadImportTemplate}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover"
          >
            Baixar Template (.xlsx)
          </button>
        </div>
      </div>

      {/* Section B — File upload (hidden when results are shown) */}
      {!result && (
        <div className="rounded-xl border border-edge bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold text-heading">
            Enviar planilha
          </h2>

          {/* Drop zone */}
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
                  onClick={(e) => {
                    e.stopPropagation();
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

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-brand/30 border-t-on-brand" />
                Processando…
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

      {/* Section C — Results */}
      {result && (
        <div className="rounded-xl border border-edge bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-heading">
            Resultado da importação
          </h2>

          {/* Metric cards */}
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
              label="Produtos reaproveitados"
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

          {/* Errors table */}
          {hasErrors && (
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">
                Erros ({result.errors.length})
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
                    {result.errors.map((err, i) => (
                      <tr
                        key={i}
                        className="bg-red-50/50 text-red-700 dark:bg-red-500/5 dark:text-red-300"
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-mono">
                          {err.rowNumber}
                        </td>
                        <td className="px-3 py-2">{err.productName}</td>
                        <td className="px-3 py-2">{err.category}</td>
                        <td className="px-3 py-2 font-mono">
                          {err.skuCode}
                        </td>
                        <td className="px-3 py-2">
                          {err.field && (
                            <span className="mr-1 font-semibold">
                              [{err.field}]
                            </span>
                          )}
                          {err.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-edge bg-surface-alt px-3.5 py-2 text-xs font-semibold text-heading shadow-sm transition hover:bg-surface"
            >
              <span className="text-base leading-none">📤</span>
              Importar outro arquivo
            </button>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-on-brand shadow shadow-brand/40 transition hover:bg-brand-hover"
            >
              Ver produtos
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── small helper ─── */

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
