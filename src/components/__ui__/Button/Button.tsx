import React from 'react';
import './Button.scss';

interface ButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'text';
}

const Button: React.FC<ButtonProps> = ({ children, variant, ...props }: React.PropsWithChildren<ButtonProps>) => {
  const classNames: string[] = [];

  if (variant) {
    classNames.push(`button-${variant}`);
  } else {
    classNames.push('button');
  }

  if (children) {
    return <input type="button" className={classNames.join(' ')} value={children.toString()} {...props} />;
  }

  return <input {...props} type="button" className={classNames.join(' ')} />;
};

export default Button;
