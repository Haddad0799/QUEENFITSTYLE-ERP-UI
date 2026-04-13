export type Category = {
  id: number;
  name: string;
  active: boolean;
  parentId?: number | null;
  children?: Category[];
};

export type CategoriesDetailsDTO = {
  categorias: Category[];
};

