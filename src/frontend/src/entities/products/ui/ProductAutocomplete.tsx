import { CircularProgress, type FilterOptionsState } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { type FC, useState, type SyntheticEvent, type ReactElement } from 'react';
import { useToggle } from '@/shared/hooks';
import { type SelectOption, type SelectProps } from '@/types';
import { type ProductOptionType, type ProductFormType } from '../model';
import { ProductInputDialog } from './ProductInputDialog';

const filter = createFilterOptions<ProductOptionType>();

const getOptionLabel = (option: string | ProductOptionType): string => {
  if (typeof option === 'string') {
    return option;
  }

  if (option.inputValue) {
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

interface Props {
  options: readonly ProductOptionType[];
  loading: boolean;
  value: ProductOptionType | null;
  valueTemporary?: boolean;
  helperText?: string;
  error?: boolean;
  renderCategoryInput: (props: SelectProps<SelectOption>) => ReactElement;
  onChange: (selectedProduct: ProductOptionType | null) => void;
}

export const ProductAutocomplete: FC<Props> = ({
  options,
  loading,
  value,
  valueTemporary = false,
  helperText,
  error,
  renderCategoryInput,
  onChange,
}) => {
  const [valueAddedOnTheFly, setValueAddedOnTheFly] = useState(valueTemporary);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogSubmitText, setDialogSubmitText] = useState('');
  const [dialogOpened, toggleDialog] = useToggle();
  const [dialogValue, setDialogValue] = useState<ProductFormType>(EMPTY_DIALOG_VALUE);

  const handleDialogClose = (): void => {
    toggleDialog();
  };

  const filterOptions = (
    options: ProductOptionType[],
    state: FilterOptionsState<ProductOptionType>,
  ): ProductOptionType[] => {
    const filtered = filter(options, state);

    if (filtered.some(o => o.name === state.inputValue)) {
      return filtered;
    }

    if (state.inputValue !== '') {
      filtered.push({
        inputValue: state.inputValue,
        name: `Add "${state.inputValue}"`,
        defaultQuantity: 100,
      });

      setTimeout(() => {
        setDialogTitle('Add product');
        setDialogSubmitText('Create');
      });

      return filtered;
    }

    if (value && valueAddedOnTheFly) {
      filtered.unshift({
        inputValue: value.name,
        name: `Edit "${value.name}"`,
        defaultQuantity: value.defaultQuantity,
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
    selectedProduct: string | ProductOptionType | null,
  ): void => {
    if (typeof selectedProduct === 'string') {
      toggleDialog();
      setDialogValue(({ caloriesCost, defaultQuantity, category }) => ({
        name: selectedProduct,
        caloriesCost,
        defaultQuantity,
        category,
      }));
    } else if (selectedProduct?.inputValue) {
      const { inputValue, defaultQuantity } = selectedProduct;
      toggleDialog();
      setDialogValue(({ caloriesCost, category }) => ({
        name: inputValue,
        caloriesCost,
        defaultQuantity,
        category,
      }));
    } else {
      setDialogValue(EMPTY_DIALOG_VALUE);
      onChange(selectedProduct);
      setValueAddedOnTheFly(false);
    }
  };

  const handleSubmit = (product: ProductFormType): void => {
    setDialogValue(product);
    onChange({
      name: product.name,
      defaultQuantity: product.defaultQuantity,
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
      <ProductInputDialog
        title={dialogTitle}
        submitText={dialogSubmitText}
        formId="product-form"
        opened={dialogOpened}
        submitting={false}
        product={dialogValue}
        renderCategoryInput={renderCategoryInput}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />
    </>
  );
};
