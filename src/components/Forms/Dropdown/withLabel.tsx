import React from 'react';
import { DropdownProps } from './Dropdown';
import '../FormControls.scss';

/**
 * Adds label for specified dropdown component
 */
const withLabel = (
  DropdownComponent: React.FC<DropdownProps>,
  label: string,
  isInline = false,
): React.FC<DropdownProps> => {
  const Test: React.FC<DropdownProps> = props => {
    const containerCssClasses = ['labeled-container'];
    if (isInline) {
      containerCssClasses.push('labeled-container_inline');
    }

    return (
      <div className={containerCssClasses.join(' ')}>
        <div className="labeled-container__label">{label}</div>
        <div className="labeled-container__target">
          <DropdownComponent {...props}></DropdownComponent>
        </div>
      </div>
    );
  };
  return Test;
};

export default withLabel;
