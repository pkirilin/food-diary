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
  const getDisplayName = (option: SelectOption): string => {
    return option.name;
  };

  const areOptionsEqual = (first: SelectOption, second: SelectOption): boolean => {
    return first.name === second.name;
  };

  const handleChange = (value: SelectOption | null): void => {
    setValue(value);
  };

  return (
    <AppSelect
      availableOptions={options}
      value={value}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
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
