import React from 'react';
import './SidebarSelectionPanelOptions.scss';

interface SidebarSelectionPanelOptionsProps {
  withoutSelection?: boolean;
}

const SidebarSelectionPanelOptions: React.FC<SidebarSelectionPanelOptionsProps> = ({
  children,
  withoutSelection = false,
}: React.PropsWithChildren<SidebarSelectionPanelOptionsProps>) => {
  const classNames = ['sidebar-selection-panel-options'];
  if (withoutSelection) {
    classNames.push('sidebar-selection-panel-options_without-selection');
  } else {
    classNames.push('sidebar-selection-panel-options_with-selection');
  }

  return <div className={classNames.join(' ')}>{children}</div>;
};

export default SidebarSelectionPanelOptions;
