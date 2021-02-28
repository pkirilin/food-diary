import { useState } from 'react';
import { BindFunction } from './types';

export function createInputHook<TValue, TBindingProps>(
  createBinding: (
    value: TValue,
    setValue: React.Dispatch<React.SetStateAction<TValue>>,
  ) => TBindingProps,
) {
  return function (
    initialValue: TValue,
  ): [TValue, React.Dispatch<React.SetStateAction<TValue>>, BindFunction<TBindingProps>] {
    const [value, setValue] = useState(initialValue);
    return [value, setValue, () => createBinding(value, setValue)];
  };
}
