import React from 'react';
import './Checkbox.scss';

interface CheckboxProps {
  checked: boolean;
  onCheck: React.ChangeEventHandler<HTMLInputElement>;
  label?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onCheck, label = '', disabled = false }: CheckboxProps) => {
  const containerClassNames = ['checkbox-container'];

  if (label !== '') {
    containerClassNames.push('checkbox-container_labeled');
  }

  if (disabled) {
    containerClassNames.push('checkbox-container_disabled');
  }

  return (
    <label className={containerClassNames.join(' ')}>
      <input
        type="checkbox"
        className="checkbox-container__input"
        onChange={onCheck}
        checked={checked}
        disabled={disabled}
      />
      <div className="checkbox-container__label">{label}</div>
      <span className="checkbox-container__checkmark"></span>
    </label>
  );
};

export default Checkbox;
