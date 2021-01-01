export interface BindableObject<TValue, TBinding> {
  value: TValue;
  setValue: React.Dispatch<React.SetStateAction<TValue>>;
  binding: TBinding;
}
