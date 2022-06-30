import { screen } from '@testing-library/dom';
import { render } from 'src/testing';
import Categories from './Categories';

test('first test', () => {
  render(<Categories></Categories>);

  expect(screen.getByText(/dairy/i));
  expect(screen.getByText(/bakery/i));
  expect(screen.getByText(/frozen foods/i));
  expect(screen.getByLabelText(/2 products in dairy/i));
  expect(screen.getByLabelText(/1 product in bakery/i));
  expect(screen.getByLabelText(/no products in frozen foods/i));
});
