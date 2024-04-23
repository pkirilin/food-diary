import { ThemeProvider } from '@mui/material';
import { type ReactElement } from 'react';
import { type Mock } from 'vitest';
import theme from '@/theme';
import { type AutocompleteOptionType } from '../../model';
import { ProductAutocomplete } from './ProductAutocomplete';

export class AutocompleteOptionTypeBuilder {
  private static _nextId = 0;

  constructor(private readonly _name: string) {}

  please(): AutocompleteOptionType {
    return {
      id: ++AutocompleteOptionTypeBuilder._nextId,
      name: this._name,
      defaultQuantity: 100,
    };
  }
}

export class ProductAutocompleteBuilder {
  private _onChangeMock = vi.fn();
  private readonly _options: AutocompleteOptionType[] = [];

  please(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <ProductAutocomplete
          options={this._options}
          loading={false}
          value={null}
          onChange={this._onChangeMock}
          renderCategoryInput={vi.fn()}
        />
      </ThemeProvider>
    );
  }

  withOnChangeMock(fn: Mock): this {
    this._onChangeMock = fn;
    return this;
  }

  withOptions(options: AutocompleteOptionType[]): this {
    this._options.push(...options);
    return this;
  }
}

export const createProductAutocomplete = (): ProductAutocompleteBuilder =>
  new ProductAutocompleteBuilder();

const createAutocompleteOption = (name: string): AutocompleteOptionTypeBuilder =>
  new AutocompleteOptionTypeBuilder(name);

export const givenOptions = (...names: string[]): AutocompleteOptionType[] =>
  names.map(name => createAutocompleteOption(name).please());
