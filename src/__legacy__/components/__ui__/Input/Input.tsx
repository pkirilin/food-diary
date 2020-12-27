import React from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'date';
  controlSize?: 'small' | 'normal';
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Input: React.FC<InputProps> = ({ type = 'text', controlSize = 'normal', inputRef, ...props }: InputProps) => {
  const classNames = ['input'];

  if (controlSize) {
    classNames.push(`input_${controlSize}`);
  }

  return <input {...props} ref={inputRef} type={type} className={classNames.join(' ')} />;
};

export default Input;
