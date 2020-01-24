import React from 'react';
import './Checkbox.scss';

interface CheckboxProps {
  checked: boolean;
  onCheck: React.ChangeEventHandler<HTMLInputElement>;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheck, label = '' }: CheckboxProps) => {
  return (
    <label className="checkbox-container">
      <div className="checkbox-container__label">{label}</div>
      <input type="checkbox" className="checkbox-container__input" onChange={onCheck} checked={checked} />
      <span className="checkbox-container__checkmark"></span>
    </label>
  );
};

export default Checkbox;
