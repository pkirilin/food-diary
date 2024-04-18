import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { type FC, type FormEvent, useState } from 'react';

interface ProductOptionType {
  inputValue?: string;
  name: string;
}

interface ProductFormType {
  name: string;
}

const filter = createFilterOptions<ProductOptionType>();

const PRODUCTS: readonly ProductOptionType[] = [{ name: 'Bread' }, { name: 'Rice' }];

export const ProductAutocomplete: FC = () => {
  const [value, setValue] = useState<ProductOptionType | null>(null);
  const [open, toggleOpen] = useState(false);

  const handleClose = (): void => {
    setDialogValue({
      name: '',
    });
    toggleOpen(false);
  };

  const [dialogValue, setDialogValue] = useState<ProductFormType>({
    name: '',
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setValue({
      name: dialogValue.name,
    });
    handleClose();
  };

  return (
    <>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            // timeout to avoid instant validation of the dialog's form.
            setTimeout(() => {
              toggleOpen(true);
              setDialogValue({
                name: newValue,
              });
            });
          } else if (newValue?.inputValue) {
            toggleOpen(true);
            setDialogValue({
              name: newValue.inputValue,
            });
          } else {
            setValue(newValue);
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (params.inputValue !== '') {
            filtered.push({
              inputValue: params.inputValue,
              name: `Add "${params.inputValue}"`,
            });
          }

          return filtered;
        }}
        options={PRODUCTS}
        getOptionLabel={option => {
          // for example value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.name;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        renderOption={(props, option) => <li {...props}>{option.name}</li>}
        sx={{ width: 300 }}
        freeSolo
        renderInput={params => (
          <TextField {...params} label="Product" placeholder="Select a product" />
        )}
      />
      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add a new product</DialogTitle>
          <DialogContent>
            <DialogContentText>Add new product info</DialogContentText>
            <TextField
              label="Name"
              autoFocus
              value={dialogValue.name}
              onChange={event =>
                setDialogValue({
                  ...dialogValue,
                  name: event.target.value,
                })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};
