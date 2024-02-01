import { type FC } from 'react';
import { AppSelect } from 'src/components';
import { type SelectOption, type SelectProps } from 'src/types';

interface CategorySelectProps extends SelectProps<SelectOption> {
  options: SelectOption[];
  optionsLoading: boolean;
}

const CategorySelect: FC<CategorySelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
  options,
  optionsLoading,
}) => {
  const handleChange = (value: SelectOption | null): void => {
    setValue(value);
  };

  return (
    <AppSelect
      options={options}
      value={value}
      onChange={handleChange}
      isLoading={optionsLoading}
      isInvalid={isInvalid}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
    />
  );
};

export default CategorySelect;
