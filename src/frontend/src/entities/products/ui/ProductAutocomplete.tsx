import { type FilterOptionsState } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {
  type FC,
  type FormEvent,
  useState,
  type SyntheticEvent,
  type ChangeEventHandler,
} from 'react';
import { useToggle } from '@/shared/hooks';
import { type ProductFormType } from '../model';
import { ProductInputDialog } from './ProductInputDialog';

interface ProductOptionType {
  inputValue?: string;
  name: string;
}

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

const PRODUCTS: readonly ProductOptionType[] = [{ name: 'Bread' }, { name: 'Rice' }];

export const ProductAutocomplete: FC = () => {
  const [value, setValue] = useState<ProductOptionType | null>(null);
  const [valueAddedOnTheFly, setValueAddedOnTheFly] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogSubmitText, setDialogSubmitText] = useState('');
  const [dialogOpened, toggleDialog] = useToggle();

  const handleDialogClose = (): void => {
    setDialogValue({
      name: '',
    });
    toggleDialog();
  };

  const [dialogValue, setDialogValue] = useState<ProductFormType>({
    name: '',
  });

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
    newValue: string | ProductOptionType | null,
  ): void => {
    if (typeof newValue === 'string') {
      setTimeout(() => {
        toggleDialog();
        setDialogValue({
          name: newValue,
        });
      });
    } else if (newValue?.inputValue) {
      toggleDialog();
      setDialogValue({
        name: newValue.inputValue,
      });
    } else {
      setValue(newValue);
      setValueAddedOnTheFly(false);
    }
  };

  const handleProductNameChange: ChangeEventHandler<HTMLInputElement> = event => {
    setDialogValue({
      ...dialogValue,
      name: event.target.value,
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setValue({
      name: dialogValue.name,
    });
    setValueAddedOnTheFly(true);
    handleDialogClose();
  };

  return (
    <>
      <Autocomplete
        value={value}
        onChange={handleOptionChange}
        options={PRODUCTS}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo
        getOptionLabel={getOptionLabel}
        filterOptions={filterOptions}
        renderOption={(props, option) => <li {...props}>{option.name}</li>}
        renderInput={params => (
          <TextField {...params} label="Product" placeholder="Select a product" />
        )}
      />
      <ProductInputDialog
        title={dialogTitle}
        submitText={dialogSubmitText}
        formId="product-form"
        opened={dialogOpened}
        product={dialogValue}
        handleClose={handleDialogClose}
        handleSubmit={handleSubmit}
        handleProductNameChange={handleProductNameChange}
      />
    </>
  );
};
