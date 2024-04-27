import { CircularProgress, type FilterOptionsState } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { type FC, type SyntheticEvent } from 'react';
import { type AutocompleteOptionType, type ProductFormType } from '../../model';

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

const EMPTY_DIALOG_VALUE: ProductFormType = {
  name: '',
  defaultQuantity: 100,
  caloriesCost: 100,
  category: null,
};

export interface ProductAutocompleteProps {
  options: readonly AutocompleteOptionType[];
  loading: boolean;
  value: AutocompleteOptionType | null;
  onChange: (selectedProduct: AutocompleteOptionType | null) => void;
  dialogValue: ProductFormType;
  helperText?: string;
  error?: boolean;
  autoFocus?: boolean;
}

export const ProductAutocompleteWithoutDialog: FC<ProductAutocompleteProps> = ({
  options,
  loading,
  value,
  onChange,
  dialogValue,
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
      filtered.push({
        freeSolo: true,
        editing: false,
        inputValue: state.inputValue,
        name: `Add "${state.inputValue}"`,
        caloriesCost: EMPTY_DIALOG_VALUE.caloriesCost,
        defaultQuantity: EMPTY_DIALOG_VALUE.defaultQuantity,
        category: EMPTY_DIALOG_VALUE.category,
      });

      return filtered;
    }

    if (value?.freeSolo) {
      filtered.unshift({
        freeSolo: true,
        editing: true,
        inputValue: value.name,
        name: `Edit "${value.name}"`,
        caloriesCost: dialogValue.caloriesCost,
        defaultQuantity: dialogValue.defaultQuantity,
        category: dialogValue.category,
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
      // toggleDialog();
      // setDialogValue(({ caloriesCost, defaultQuantity, category }) => ({
      //   name: selectedProduct,
      //   caloriesCost,
      //   defaultQuantity,
      //   category,
      // }));

      // onDialogValueChange({
      //   ...dialogValue,
      //   name: selectedProduct,
      // });

      onChange({
        freeSolo: true,
        editing: false,
        name: selectedProduct,
        caloriesCost: dialogValue.caloriesCost,
        defaultQuantity: dialogValue.defaultQuantity,
        category: dialogValue.category,
      });

      return;
    }

    if (selectedProduct?.freeSolo && selectedProduct?.inputValue) {
      // const { inputValue, defaultQuantity } = selectedProduct;
      // toggleDialog();
      // setDialogValue(({ caloriesCost, category }) => ({
      //   name: inputValue,
      //   caloriesCost,
      //   defaultQuantity,
      //   category,
      // }));

      // onDialogValueChange({
      //   ...dialogValue,
      //   name: inputValue,
      //   defaultQuantity,
      // });

      onChange({
        freeSolo: true,
        editing: selectedProduct.editing,
        name: selectedProduct.inputValue,
        inputValue: selectedProduct.inputValue,
        defaultQuantity: selectedProduct.defaultQuantity,
        caloriesCost: dialogValue.caloriesCost,
        category: dialogValue.category,
      });

      return;
    }

    onChange(selectedProduct);
  };

  return (
    <>
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
    </>
  );
};
