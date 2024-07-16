import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import {
  CircularProgress,
  type FilterOptionsState,
  Autocomplete,
  createFilterOptions,
  type SvgIconOwnProps,
  Box,
  type AutocompleteCloseReason,
} from '@mui/material';
import TextField from '@mui/material/TextField';
import { useState, type FC, type SyntheticEvent } from 'react';
import { type FormValues, type AutocompleteOption, EMPTY_FORM_VALUES } from '../model';

const filter = createFilterOptions<AutocompleteOption>();

const getOptionLabel = (option: string | AutocompleteOption): string => {
  if (typeof option === 'string') {
    return option;
  }

  if (option.freeSolo && option.inputValue) {
    return option.inputValue;
  }

  return option.name;
};

export interface ProductAutocompleteProps {
  options: readonly AutocompleteOption[];
  loading: boolean;
  value: AutocompleteOption | null;
  formValues: FormValues;
  forceValidate: () => void;
  helperText?: string;
  error?: boolean;
  autoFocus?: boolean;
  onChange: (selectedProduct: AutocompleteOption | null) => void;
}

export const ProductAutocomplete: FC<ProductAutocompleteProps> = ({
  options,
  loading,
  value,
  formValues,
  forceValidate,
  helperText,
  error,
  autoFocus,
  onChange,
}) => {
  const [newProductIconColor, setNewProductIconColor] =
    useState<SvgIconOwnProps['color']>('action');

  const filterOptions = (
    options: AutocompleteOption[],
    state: FilterOptionsState<AutocompleteOption>,
  ): AutocompleteOption[] => {
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
    selectedProduct: string | AutocompleteOption | null,
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

  const handleClose = (_: SyntheticEvent, reason: AutocompleteCloseReason): void => {
    if (reason === 'blur' || reason === 'escape' || reason === 'toggleInput') {
      forceValidate();
    }
  };

  return (
    <Autocomplete
      value={value}
      onChange={handleOptionChange}
      onClose={handleClose}
      options={options}
      selectOnFocus
      handleHomeEndKeys
      blurOnSelect="touch"
      freeSolo
      getOptionLabel={getOptionLabel}
      filterOptions={filterOptions}
      renderOption={(props, option) => (
        <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
          {option.freeSolo && (
            <Box display="flex">
              {option.editing ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
            </Box>
          )}
          <Box display="flex">{option.name}</Box>
        </Box>
      )}
      renderInput={inputParams => (
        <TextField
          {...inputParams}
          label="Product"
          placeholder="Select a product"
          margin="normal"
          error={error}
          helperText={helperText}
          autoFocus={autoFocus}
          onFocus={() => {
            setNewProductIconColor('primary');
          }}
          onBlur={() => {
            setNewProductIconColor('action');
          }}
          InputProps={{
            ...inputParams.InputProps,
            startAdornment: value?.freeSolo ? <FiberNewIcon color={newProductIconColor} /> : null,
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
