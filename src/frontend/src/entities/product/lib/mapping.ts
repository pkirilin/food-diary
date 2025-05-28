import { type Product, type GetProductsRequest } from '../api';
import { type ProductFormValues, type ProductItemsFilter } from '../model';

export const mapToGetProductsRequest = ({
  pageNumber,
  pageSize,
  productSearchName,
  category,
}: ProductItemsFilter): GetProductsRequest => ({
  pageNumber,
  pageSize,
  productSearchName,
  categoryId: category?.id,
});

export const mapToProductFormData = ({
  name,
  caloriesCost,
  defaultQuantity,
  categoryId,
  categoryName,
  protein,
  fats,
  carbs,
  sugar,
  salt,
}: Product): ProductFormValues => ({
  name,
  caloriesCost,
  defaultQuantity,
  category: {
    id: categoryId,
    name: categoryName,
  },
  protein,
  fats,
  carbs,
  sugar,
  salt,
});
