import type { Category } from '../types/categories';

export type LeafCategoryOption = {
  id: number;
  name: string;
  path: string;
  label: string;
  shortLabel: string;
  active: boolean;
  rootId: number;
  rootName: string;
};

const CATEGORY_LIST_KEYS = [
  'categorias',
  'categories',
  'items',
  'content',
  'data',
  'results',
] as const;

const CATEGORY_CHILD_KEYS = [
  'children',
  'subcategories',
  'subCategorias',
  'childCategories',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'active', 'ativa', 'ativo', 'enabled'].includes(normalized)) {
      return true;
    }
    if (
      ['false', '0', 'inactive', 'inativa', 'inativo', 'disabled'].includes(
        normalized,
      )
    ) {
      return false;
    }
  }
  return false;
}

function getParentId(node: Record<string, unknown>): number | null {
  const directParentId = toNumber(
    node.parentId ?? node.parentCategoryId ?? node.parent_id,
  );
  if (directParentId !== null) return directParentId;

  if (isRecord(node.parent)) {
    return toNumber(node.parent.id);
  }

  return null;
}

function getChildren(node: Record<string, unknown>): unknown[] {
  for (const key of CATEGORY_CHILD_KEYS) {
    const value = node[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function normalizeCategory(
  input: unknown,
  inheritedParentId: number | null = null,
): Category | null {
  if (!isRecord(input)) return null;

  const id = toNumber(input.id);
  const name =
    typeof input.name === 'string'
      ? input.name
      : typeof input.nome === 'string'
        ? input.nome
        : null;

  if (id === null || !name) return null;

  const activeSource = input.active ?? input.ativa ?? input.enabled ?? input.status;
  const parentId = getParentId(input) ?? inheritedParentId;

  const children = getChildren(input)
    .map((child) => normalizeCategory(child, id))
    .filter((child): child is Category => child !== null);

  return {
    id,
    name,
    active: toBoolean(activeSource),
    parentId,
    children,
  };
}

export function extractCategories(payload: unknown): Category[] {
  const source = Array.isArray(payload)
    ? payload
    : CATEGORY_LIST_KEYS.map((key) => (isRecord(payload) ? payload[key] : undefined)).find(
        Array.isArray,
      ) ?? [];

  if (!Array.isArray(source)) return [];

  return source
    .map((item) => normalizeCategory(item))
    .filter((category): category is Category => category !== null);
}

export function buildCategoryTree(categories: Category[]): Category[] {
  const hasNested = categories.some((category) => (category.children?.length ?? 0) > 0);
  if (hasNested) {
    return categories.filter((category) => !category.parentId);
  }

  const map = new Map<number, Category>();
  const roots: Category[] = [];

  for (const category of categories) {
    map.set(category.id, { ...category, children: [] });
  }

  for (const category of categories) {
    const node = map.get(category.id);
    if (!node) continue;

    if (category.parentId && map.has(category.parentId)) {
      map.get(category.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function getLeafCategoryOptions(
  categories: Category[],
): LeafCategoryOption[] {
  const tree = buildCategoryTree(categories);
  const leafOptions: LeafCategoryOption[] = [];

  const visit = (node: Category, ancestors: string[], root: Category) => {
    const pathParts = [...ancestors, node.name];
    const children = node.children ?? [];

    if (children.length === 0) {
      if (node.parentId !== null && node.parentId !== undefined) {
        const path = pathParts.join(' / ');
        const shortLabel = pathParts.slice(1).join(' / ') || node.name;

        leafOptions.push({
          id: node.id,
          name: node.name,
          path,
          label: path,
          shortLabel,
          active: node.active,
          rootId: root.id,
          rootName: root.name,
        });
      }
      return;
    }

    for (const child of children) {
      visit(child, pathParts, root);
    }
  };

  for (const root of tree) {
    visit(root, [], root);
  }

  return leafOptions;
}
