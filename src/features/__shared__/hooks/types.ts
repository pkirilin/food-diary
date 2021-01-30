export interface BindableHookResult<TBinding> {
  binding: TBinding;
}

// TODO: remove
export interface BindableValueHookResult<TValue, TBinding> extends BindableHookResult<TBinding> {
  value: TValue;
  setValue: React.Dispatch<React.SetStateAction<TValue>>;
}
