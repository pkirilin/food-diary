import { CircularProgress, type FilterOptionsState } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { type FC, useState, type SyntheticEvent, type ReactElement } from 'react';
import { useToggle } from '@/shared/hooks';
import {
  mapToProductFormType,
  type AutocompleteOptionType,
  type ProductFormType,
} from '../../model';
import { type ProductInputDialogProps } from '../ProductInputDialog';

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

export type RenderInputDialogProps = Omit<ProductInputDialogProps, 'renderCategoryInput'>;

export interface ProductAutocompleteProps {
  options: readonly AutocompleteOptionType[];
  loading: boolean;
  value: AutocompleteOptionType | null;
  helperText?: string;
  error?: boolean;
  autoFocus?: boolean;
  renderInputDialog: (props: RenderInputDialogProps) => ReactElement;
  onChange: (selectedProduct: AutocompleteOptionType | null) => void;
}

export const ProductAutocomplete: FC<ProductAutocompleteProps> = ({
  options,
  loading,
  value,
  helperText,
  error,
  autoFocus,
  renderInputDialog,
  onChange,
}) => {
  const [valueAddedOnTheFly, setValueAddedOnTheFly] = useState(value?.freeSolo ?? false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogSubmitText, setDialogSubmitText] = useState('');
  const [dialogOpened, toggleDialog] = useToggle();

  const [dialogValue, setDialogValue] = useState<ProductFormType>(
    value?.freeSolo ? mapToProductFormType(value) : EMPTY_DIALOG_VALUE,
  );

  const handleDialogClose = (): void => {
    toggleDialog();
  };

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

      setTimeout(() => {
        setDialogTitle('Add product');
        setDialogSubmitText('Create');
        setDialogValue(EMPTY_DIALOG_VALUE);
      });

      return filtered;
    }

    if (value && valueAddedOnTheFly) {
      filtered.unshift({
        freeSolo: true,
        editing: false,
        inputValue: value.name,
        name: `Edit "${value.name}"`,
        caloriesCost: dialogValue.caloriesCost,
        defaultQuantity: dialogValue.defaultQuantity,
        category: dialogValue.category,
      });

      setTimeout(() => {
        setDialogTitle('Edit product');
        setDialogSubmitText('Save');
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
      toggleDialog();
      setDialogValue(({ caloriesCost, defaultQuantity, category }) => ({
        name: selectedProduct,
        caloriesCost,
        defaultQuantity,
        category,
      }));
      return;
    }

    if (selectedProduct?.freeSolo && selectedProduct?.inputValue) {
      const { inputValue, defaultQuantity } = selectedProduct;
      toggleDialog();
      setDialogValue(({ caloriesCost, category }) => ({
        name: inputValue,
        caloriesCost,
        defaultQuantity,
        category,
      }));
      return;
    }

    setDialogValue(EMPTY_DIALOG_VALUE);
    onChange(selectedProduct);
    setValueAddedOnTheFly(false);
  };

  const handleSubmit = (product: ProductFormType): void => {
    setDialogValue(product);
    onChange({
      freeSolo: true,
      editing: false,
      name: product.name,
      caloriesCost: product.caloriesCost,
      defaultQuantity: product.defaultQuantity,
      category: product.category,
    });
    setValueAddedOnTheFly(true);
    handleDialogClose();
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
      {renderInputDialog({
        title: dialogTitle,
        submitText: dialogSubmitText,
        formId: 'product-form',
        opened: dialogOpened,
        submitting: false,
        product: dialogValue,
        onClose: handleDialogClose,
        onSubmit: handleSubmit,
      })}
    </>
  );
};