import React from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'date';
}

const Input: React.FC<InputProps> = ({ type = 'text', disabled, ...props }: InputProps) => {
  const classNames = ['input'];
  if (disabled) {
    classNames.push('input_disabled');
  }
  return <input type={type} className={classNames.join(' ')} disabled={disabled} {...props} />;
};

export default Input;
