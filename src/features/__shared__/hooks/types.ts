import { AutocompleteProps } from '@material-ui/lab';

export interface BindableHookResult<TBinding> {
  binding: TBinding;
}

export interface BindableValueHookResult<TValue, TBinding> extends BindableHookResult<TBinding> {
  value: TValue;
  setValue: React.Dispatch<React.SetStateAction<TValue>>;
}

export type BindFunction<TBindingProps> = () => TBindingProps;
export type ValidatorFunction<TValue> = (value: TValue) => boolean;

export type BaseInputHook<TValue, TResult extends Array<unknown>, TArg = void> = (
  initialValue: TValue,
  arg: TArg,
) => TResult;

export type InputHook<TValue, TBindingProps, TArg = void> = BaseInputHook<
  TValue,
  [TValue, React.Dispatch<React.SetStateAction<TValue>>, BindFunction<TBindingProps>],
  TArg
>;

export type ValidatedInputHook<TValue, TBindingProps, TArg = void> = BaseInputHook<
  TValue,
  [TValue, React.Dispatch<React.SetStateAction<TValue>>, BindFunction<TBindingProps>, boolean],
  TArg
>;

export type AutocompleteBindingProps<TOption> = Omit<
  AutocompleteProps<TOption, undefined, undefined, undefined>,
  'renderInput'
>;
