import React from 'react';
import './Button.scss';

type ButtonProps = React.DOMAttributes<HTMLInputElement> & React.InputHTMLAttributes<HTMLInputElement>;

const Button: React.FC<ButtonProps> = ({ children, ...props }: React.PropsWithChildren<ButtonProps>) => {
  if (children) {
    return <input type="button" className="button" value={children.toString()} {...props} />;
  }

  return <input {...props} type="button" className="button" />;
};

export default Button;
