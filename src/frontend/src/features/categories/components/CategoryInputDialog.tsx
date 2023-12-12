import { TextField } from '@mui/material';
import {
  type FC,
  useEffect,
  type Dispatch,
  type SetStateAction,
  type FormEventHandler,
} from 'react';
import { AppButton, AppDialog } from 'src/components';
import { useInput } from 'src/hooks';
import { mapToTextInputProps } from 'src/utils/inputMapping';
import { validateCategoryName } from 'src/utils/validation';
import { type Category, type CategoryFormData } from '../types';

interface CreateEditCategoryDialogProps {
  isOpened: boolean;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  title: string;
  submitText: string;
  onSubmit: (category: CategoryFormData) => void;
  isLoading: boolean;
  category?: Category;
}

const CategoryInputDialog: FC<CreateEditCategoryDialogProps> = ({
  isOpened: isDialogOpened,
  setIsOpened: setIsDialogOpened,
  title,
  submitText,
  onSubmit,
  isLoading,
  category,
}) => {
  const {
    inputProps: categoryNameInputProps,
    value: categoryName,
    clearValue: clearCategoryName,
    isInvalid: isCategoryNameInvalid,
    isTouched: isCategoryNameTouched,
  } = useInput({
    initialValue: category?.name ?? '',
    errorHelperText: 'Category name is invalid',
    validate: validateCategoryName,
    mapToInputProps: mapToTextInputProps,
  });

  const isSubmitDisabled = isCategoryNameInvalid || !isCategoryNameTouched;

  useEffect(() => {
    if (isDialogOpened) {
      clearCategoryName();
    }
  }, [isDialogOpened, clearCategoryName, category]);

  const handleClose = (): void => {
    setIsDialogOpened(false);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();
    onSubmit({ name: categoryName });
  };

  return (
    <AppDialog
      title={title}
      isOpened={isDialogOpened}
      onClose={handleClose}
      content={
        <form id="category-input-form" onSubmit={handleSubmit}>
          <TextField
            {...categoryNameInputProps}
            autoFocus
            margin="dense"
            fullWidth
            label="Category name"
            placeholder="Enter category name"
          />
        </form>
      }
      actionSubmit={
        <AppButton
          type="submit"
          form="category-input-form"
          variant="contained"
          disabled={isSubmitDisabled}
          isLoading={isLoading}
          aria-label={`${category ? 'Save' : 'Create'} ${categoryName} and close dialog`}
        >
          {submitText}
        </AppButton>
      }
      actionCancel={
        <AppButton type="button" disabled={isLoading} onClick={handleClose}>
          Cancel
        </AppButton>
      }
    />
  );
};

export default CategoryInputDialog;
