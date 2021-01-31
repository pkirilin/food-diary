import { useEffect, useState } from 'react';
import useTypedSelector from './useTypedSelector';
import { RootState } from '../../../store';
import { AutocompleteProps } from '@material-ui/lab';
import { BindableHookResult } from './types';
import { AutocompleteOption } from '../models';

type OptionsSelector<TOption> = (state: RootState) => TOption[];
type GetOptionsAction = (active: boolean) => void;
type ClearOptionsAction = () => void;

type AsyncAutocompleteBinding<TOption> = AutocompleteProps<
  TOption,
  undefined,
  undefined,
  undefined
>;

export interface AsyncAutocompleteHookResult<TOption>
  extends BindableHookResult<AsyncAutocompleteBinding<TOption>> {
  options: TOption[];
  loading: boolean;
}

export function useAsyncAutocomplete<TOption extends AutocompleteOption>(
  selector: OptionsSelector<TOption>,
  getOptions: GetOptionsAction,
  clearOptions: ClearOptionsAction,
): AsyncAutocompleteHookResult<TOption> {
  const [open, setOpen] = useState(false);
  const options = useTypedSelector(selector);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return;
    }

    getOptions(active);

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      clearOptions();
    }
  }, [open]);

  return {
    options,
    loading,
    binding: {
      options,
      open,
      loading,
      onOpen: () => {
        setOpen(true);
      },
      onClose: () => {
        setOpen(false);
      },
      getOptionSelected: (option, value) => option.name === value.name,
      getOptionLabel: option => option.name,
      renderInput: () => null,
    },
  };
}
