import { type TextFieldProps } from '@mui/material';
import { type Dispatch, type SetStateAction } from 'react';

export type BindFunction<TBindingProps> = () => TBindingProps;
export type ValidatorFunction<TValue> = (value: TValue) => boolean;

export type BaseInputHook<TValue, TResult extends unknown[], TArg = void> = (
  initialValue: TValue,
  arg?: TArg,
) => TResult;

export type InputHook<TValue, TBindingProps, TArg = void> = BaseInputHook<
  TValue,
  [TValue, Dispatch<SetStateAction<TValue>>, BindFunction<TBindingProps>],
  TArg
>;

export type ValidatedInputHook<TValue, TBindingProps, TArg = void> = BaseInputHook<
  TValue,
  [TValue, Dispatch<SetStateAction<TValue>>, BindFunction<TBindingProps>, boolean],
  TArg
>;

export type BindingCreatorFunction<TValue, TBindingProps> = (
  value: TValue,
  setValue: Dispatch<SetStateAction<TValue>>,
) => TBindingProps;

export interface InputOptions<TValue> {
  afterChange?: (value: TValue) => void;
}

export interface ValidatedInputOptions<TValue> extends InputOptions<TValue> {
  validate: ValidatorFunction<TValue>;
  errorHelperText?: string;
}

export type ValidatedInputProps = TextFieldProps;
