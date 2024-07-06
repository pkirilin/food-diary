import { type productLib, type productModel } from '@/entities/product';
import { type Note } from '../model';

export interface RenderContentProps {
  submitLoading: boolean;
  submitDisabled: boolean;
  productAutocompleteInput: productLib.AutocompleteInput;
  productAutocompleteData: productLib.AutocompleteData;
  productFormValues: productModel.FormValues;
  onClose: () => void;
  onSubmit: (note: Note) => Promise<void>;
  onSubmitDisabledChange: (disabled: boolean) => void;
  onProductChange: (value: productModel.AutocompleteOption | null) => void;
  onProductFormValuesChange: (values: productModel.FormValues) => void;
}
