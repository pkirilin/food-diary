export interface BindableHookResult<TBinding> {
  binding: TBinding;
}

export interface BindableValueHookResult<TValue, TBinding> extends BindableHookResult<TBinding> {
  value: TValue;
  setValue: React.Dispatch<React.SetStateAction<TValue>>;
}

export type BindFunction<TBindingProps> = () => TBindingProps;

export type InputHook<TValue, TBindingProps> = (
  initialValue: TValue,
) => [TValue, React.Dispatch<React.SetStateAction<TValue>>, BindFunction<TBindingProps>];
