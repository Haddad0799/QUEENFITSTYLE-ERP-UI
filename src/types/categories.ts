export type Category = {
  id: number;
  name: string;
  active: boolean;
};

export type CategoriesDetailsDTO = {
  categorias: Category[];
};

