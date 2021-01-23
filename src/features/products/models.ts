export interface ProductItem {
  id: number;
  name: string;
  caloriesCost: number;
  categoryId: number;
  categoryName: string;
}

export interface ProductCreateEdit {
  name: string;
  caloriesCost: number;
  categoryId: number;
}

export interface ProductsSearchResult {
  productItems: ProductItem[];
  totalProductsCount: number;
}
