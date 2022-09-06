export type Product = {
  id: number;
  name: string;
  caloriesCost: number;
  categoryId: number;
  categoryName: string;
};

export type ProductsResponse = {
  productItems: Product[];
  totalProductsCount: number;
};
