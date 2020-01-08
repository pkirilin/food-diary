import React from 'react';
import './Input.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'date';
}

const Input: React.FC<InputProps> = ({ type = 'text', ...props }: InputProps) => {
  return <input type={type} className="input" {...props} />;
};

export default Input;
