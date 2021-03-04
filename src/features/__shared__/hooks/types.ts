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

export type InputHook<TValue, TBindingProps, TArg = void> = (
  initialValue: TValue,
  arg: TArg,
) => [TValue, React.Dispatch<React.SetStateAction<TValue>>, BindFunction<TBindingProps>];

export type AutocompleteBindingProps<TOption> = Omit<
  AutocompleteProps<TOption, undefined, undefined, undefined>,
  'renderInput'
>;
