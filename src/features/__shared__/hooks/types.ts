export interface BindableHookResult<TBinding> {
  binding: TBinding;
}

export interface BindableValueHookResult<TValue, TBinding> extends BindableHookResult<TBinding> {
  value: TValue;
  setValue: React.Dispatch<React.SetStateAction<TValue>>;
}
