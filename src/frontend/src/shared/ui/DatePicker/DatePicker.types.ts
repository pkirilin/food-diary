export interface DatePickerProps {
  date: Date | null;
  onChange: (value: Date | null) => void;
  label?: string;
  placeholder?: string;
  autoFocus?: boolean;
  isInvalid?: boolean;
  helperText?: string;
}
