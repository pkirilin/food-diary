import { type NoteItem } from '../api';

export const calculateCalories = ({ product, productQuantity }: NoteItem): number =>
  Math.floor((product.calories * productQuantity) / 100);

export const calculateTotalCalories = (notes: NoteItem[]): number =>
  notes.reduce((sum, note) => sum + calculateCalories(note), 0);
