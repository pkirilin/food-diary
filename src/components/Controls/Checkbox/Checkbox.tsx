import React from 'react';
import './Checkbox.scss';

interface CheckboxProps {
  checked: boolean;
  onCheck: React.ChangeEventHandler<HTMLInputElement>;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheck, label = '' }: CheckboxProps) => {
  const containerClassNames = ['checkbox-container'];
  if (label !== '') {
    containerClassNames.push('checkbox-container_labeled');
  }

  return (
    <label className={containerClassNames.join(' ')}>
      <div className="checkbox-container__label">{label}</div>
      <input type="checkbox" className="checkbox-container__input" onChange={onCheck} checked={checked} />
      <span className="checkbox-container__checkmark"></span>
    </label>
  );
};

export default Checkbox;
