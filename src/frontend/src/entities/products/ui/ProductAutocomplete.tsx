import { type FilterOptionsState } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import {
  type FC,
  type FormEvent,
  useState,
  type SyntheticEvent,
  type ChangeEventHandler,
} from 'react';
import { useToggle } from '@/shared/hooks';
import { Dialog } from '@/shared/ui';

interface ProductOptionType {
  inputValue?: string;
  name: string;
}

interface ProductFormType {
  name: string;
}

const filter = createFilterOptions<ProductOptionType>();

const filterOptions = (
  options: ProductOptionType[],
  state: FilterOptionsState<ProductOptionType>,
): ProductOptionType[] => {
  const filtered = filter(options, state);

  if (state.inputValue !== '') {
    filtered.push({
      inputValue: state.inputValue,
      name: `Add "${state.inputValue}"`,
    });
  }

  return filtered;
};

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
      <Dialog
        title="New product"
        content={
          <form id="new-product-form" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              placeholder="Product name"
              value={dialogValue.name}
              onChange={handleProductNameChange}
              autoFocus
            />
          </form>
        }
        opened={dialogOpened}
        onClose={handleDialogClose}
        renderCancel={cancelProps => (
          <Button {...cancelProps} type="button" onClick={handleDialogClose}>
            Cancel
          </Button>
        )}
        renderSubmit={submitProps => (
          <Button {...submitProps} type="submit" form="new-product-form">
            Create
          </Button>
        )}
      />
    </>
  );
};
