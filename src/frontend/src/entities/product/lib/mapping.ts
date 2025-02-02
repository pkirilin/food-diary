import { type Product, type GetProductsRequest } from '../api';
import { type FormValues, type ProductItemsFilter } from '../model';

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
}: Product): FormValues => ({
  name,
  caloriesCost,
  defaultQuantity,
  category: {
    id: categoryId,
    name: categoryName,
  },
});
