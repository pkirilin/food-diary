export type ValidatorFunction<T> = (value: T) => boolean;

export type InputOptions<TValue> = {
  value: TValue;
  setValue: (newValue: TValue) => void;
  helperText: string;
  isInvalid: boolean;
};

export type MapToInputPropsFunction<TValue, TProps> = (options: InputOptions<TValue>) => TProps;

export * from 'src/features/__shared__/types';
export * from 'src/features/__shared__/models';
