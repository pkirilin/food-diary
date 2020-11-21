import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import useInput, { InputValidator } from '../useInput';

type TestComponentProps = {
  initialValue?: string;
  validator?: InputValidator<string>;
};

function TestComponent({ initialValue = '', validator }: TestComponentProps): React.ReactElement<TestComponentProps> {
  const testInput = useInput<string>(initialValue, validator);
  return <input data-testid="input" {...testInput.binding}></input>;
}

describe('useInput', () => {
  test('should initialize input value', () => {
    // Arrange
    const initialValue = 'some input';

    // Act
    const { result } = renderHook(() => useInput<string>(initialValue));

    // Assert
    expect(result.current.value).toBe(initialValue);
  });

  test('should change input value', () => {
    // Arrange
    const newValue = 'new value';

    // Act
    const input = render(<TestComponent></TestComponent>).getByTestId('input');
    fireEvent.change(input, { target: { value: newValue } });

    // Assert
    expect(input.getAttribute('value')).toEqual(newValue);
  });

  test('should validate input value', () => {
    // Arrange
    const validator: InputValidator<string> = val => val.length > 3;

    // Act
    const { result: invalidResult } = renderHook(() => useInput<string>('aaa', validator));
    const { result: validResult } = renderHook(() => useInput<string>('aaaa', validator));

    // Assert
    expect(invalidResult.current.isValid).toBeFalsy();
    expect(validResult.current.isValid).toBeTruthy();
  });
});
