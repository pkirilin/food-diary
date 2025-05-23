export enum SortOrder {
  Ascending = 0,
  Descending = 1,
}

export interface ItemsFilterBase {
  changed: boolean;
}

export interface SelectionPayload {
  selected: boolean;
}

export interface SelectOption {
  id: number;
  name: string;
}

export type ValidatorFunction<T> = (value: T) => boolean;

export interface InputOptions<TValue> {
  value: TValue;
  setValue: (newValue: TValue) => void;
  helperText: string;
  isInvalid: boolean;
  forceValidate: () => void;
}

export type MapToInputPropsFunction<TValue, TProps> = (options: InputOptions<TValue>) => TProps;
