import React from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'date';
  controlSize?: 'small';
}

const Input: React.FC<InputProps> = ({ type = 'text', disabled, controlSize, ...props }: InputProps) => {
  const classNames = ['input'];

  if (disabled) {
    classNames.push('input_disabled');
  }

  if (controlSize) {
    classNames.push(`input_${controlSize}`);
  }

  return <input type={type} className={classNames.join(' ')} disabled={disabled} {...props} />;
};

export default Input;
