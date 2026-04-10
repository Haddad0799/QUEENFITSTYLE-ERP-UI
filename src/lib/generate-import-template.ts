import * as XLSX from 'xlsx';

const HEADERS = [
  'Nome do Produto',
  'Descrição',
  'Categoria',
  'Cor',
  'Tamanho',
  'Código SKU',
  'Largura (cm)',
  'Altura (cm)',
  'Comprimento (cm)',
  'Peso (kg)',
  'Preço de Custo',
  'Preço de Venda',
  'Quantidade em Estoque',
];

const COL_WIDTHS = [28, 28, 14, 12, 10, 22, 14, 14, 18, 12, 16, 16, 22];

export function downloadImportTemplate() {
  const wb = XLSX.utils.book_new();
  const data = [HEADERS];
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = COL_WIDTHS.map((w) => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
  XLSX.writeFile(wb, 'template_importacao_produtos.xlsx');
}
