import React from 'react';
import './Button.scss';

interface ButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'text';
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  inputRef,
  ...props
}: React.PropsWithChildren<ButtonProps>) => {
  const classNames: string[] = [];

  if (variant) {
    classNames.push(`button-${variant}`);
  } else {
    classNames.push('button');
  }

  if (children) {
    return (
      <input ref={inputRef} type="button" className={classNames.join(' ')} value={children.toString()} {...props} />
    );
  }

  return <input {...props} ref={inputRef} type="button" className={classNames.join(' ')} />;
};

export default Button;
