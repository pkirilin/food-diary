import { CircularProgress, type FilterOptionsState } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { type FC, type SyntheticEvent } from 'react';
import { EMPTY_FORM_VALUES, type AutocompleteOptionType, type FormValues } from '../model';

const filter = createFilterOptions<AutocompleteOptionType>();

const getOptionLabel = (option: string | AutocompleteOptionType): string => {
  if (typeof option === 'string') {
    return option;
  }

  if (option.freeSolo && option.inputValue) {
    return option.inputValue;
  }

  return option.name;
};

export interface ProductAutocompleteProps {
  options: readonly AutocompleteOptionType[];
  loading: boolean;
  value: AutocompleteOptionType | null;
  onChange: (selectedProduct: AutocompleteOptionType | null) => void;
  formValues: FormValues;
  helperText?: string;
  error?: boolean;
  autoFocus?: boolean;
}

export const ProductAutocomplete: FC<ProductAutocompleteProps> = ({
  options,
  loading,
  value,
  onChange,
  formValues,
  helperText,
  error,
  autoFocus,
}) => {
  const filterOptions = (
    options: AutocompleteOptionType[],
    state: FilterOptionsState<AutocompleteOptionType>,
  ): AutocompleteOptionType[] => {
    const filtered = filter(options, state);

    if (filtered.some(o => o.name === state.inputValue)) {
      return filtered;
    }

    if (state.inputValue !== '') {
      const { caloriesCost, defaultQuantity, category } = EMPTY_FORM_VALUES;

      filtered.push({
        freeSolo: true,
        editing: false,
        inputValue: state.inputValue,
        name: `Add "${state.inputValue}"`,
        caloriesCost,
        defaultQuantity,
        category,
      });

      return filtered;
    }

    if (value?.freeSolo) {
      const { caloriesCost, defaultQuantity, category } = formValues;

      filtered.unshift({
        freeSolo: true,
        editing: true,
        inputValue: value.name,
        name: `Edit "${value.name}"`,
        caloriesCost,
        defaultQuantity,
        category,
      });

      return filtered;
    }

    return filtered;
  };

  const handleOptionChange = (
    _: SyntheticEvent,
    selectedProduct: string | AutocompleteOptionType | null,
  ): void => {
    if (typeof selectedProduct === 'string') {
      const { caloriesCost, defaultQuantity, category } = formValues;

      onChange({
        freeSolo: true,
        editing: false,
        name: selectedProduct,
        caloriesCost,
        defaultQuantity,
        category,
      });

      return;
    }

    if (selectedProduct?.freeSolo && selectedProduct?.inputValue) {
      const { editing, inputValue, defaultQuantity } = selectedProduct;
      const { caloriesCost, category } = formValues;

      onChange({
        freeSolo: true,
        editing,
        name: inputValue,
        inputValue,
        defaultQuantity,
        caloriesCost,
        category,
      });

      return;
    }

    onChange(selectedProduct);
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleOptionChange}
      options={options}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo
      getOptionLabel={getOptionLabel}
      filterOptions={filterOptions}
      renderOption={(props, option) => <li {...props}>{option.name}</li>}
      renderInput={inputParams => (
        <TextField
          {...inputParams}
          label="Product"
          placeholder="Select a product"
          error={error}
          helperText={helperText}
          autoFocus={autoFocus}
          InputProps={{
            ...inputParams.InputProps,
            endAdornment: loading ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              inputParams.InputProps.endAdornment
            ),
          }}
        />
      )}
    />
  );
};
