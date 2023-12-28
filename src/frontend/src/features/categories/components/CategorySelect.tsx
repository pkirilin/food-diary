import { type FC } from 'react';
import { AppSelect } from 'src/components';
import { type SelectOption, type SelectProps } from 'src/types';

interface CategorySelectProps extends SelectProps<SelectOption> {
  options: SelectOption[];
  optionsLoaded: boolean;
  optionsLoading: boolean;
  onLoadOptions: () => Promise<void>;
}

const CategorySelect: FC<CategorySelectProps> = ({
  label,
  placeholder,
  value = null,
  setValue,
  helperText,
  isInvalid,
  options,
  optionsLoaded,
  optionsLoading,
  onLoadOptions,
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

  const handleOpen = (): void => {
    if (!optionsLoaded) {
      void onLoadOptions();
    }
  };

  return (
    <AppSelect
      availableOptions={options}
      value={value}
      getDisplayName={getDisplayName}
      areOptionsEqual={areOptionsEqual}
      onChange={handleChange}
      onOpen={handleOpen}
      isLoading={optionsLoading}
      isInvalid={isInvalid}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
    />
  );
};

export default CategorySelect;
