import { createSelector } from '@reduxjs/toolkit';
import { useAppSelector, type RootState } from '@/app/store';
import { type ProductsState } from '../model';

const selectProducts = (state: RootState): ProductsState => state.products;

const selectCheckedProductIds = createSelector(selectProducts, state => state.checkedProductIds);

export const useCheckedProductIds = (): number[] => useAppSelector(selectCheckedProductIds);
