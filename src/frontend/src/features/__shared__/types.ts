export interface SelectionPayload {
  selected: boolean;
}

export interface SelectProps<TOption> {
  label?: string;
  placeholder?: string;
  value?: TOption | null;
  setValue: (value: TOption | null) => void;
  helperText?: string;
  isInvalid?: boolean;
}
