import { type NoteItem } from '../api';

export const calculateCalories = ({ product, productQuantity }: NoteItem): number =>
  Math.floor((product.calories * productQuantity) / 100);
