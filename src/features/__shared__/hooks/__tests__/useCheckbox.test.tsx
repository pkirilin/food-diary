import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useCheckbox } from '../useCheckbox';

const TestComponent: React.FC = () => {
  const checkbox = useCheckbox();
  return <input data-testid="checkbox" type="checkbox" {...checkbox.binding} />;
};

describe('useCheckbox hook', () => {
  test('should set checked value to false by default', () => {
    // Act
    const { result } = renderHook(() => useCheckbox());

    // Assert
    expect(result.current.value).toBeFalsy();
  });

  test('should change checked value', () => {
    // Act
    const { getByTestId } = render(<TestComponent></TestComponent>);
    const checkbox = getByTestId('checkbox') as HTMLInputElement;
    fireEvent.click(checkbox);

    // Assert
    expect(checkbox.checked).toBeTruthy();
  });
});
