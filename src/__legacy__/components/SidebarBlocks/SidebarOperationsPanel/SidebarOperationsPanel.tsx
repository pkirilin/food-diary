import React from 'react';
import './SidebarOperationsPanel.scss';

interface SidebarOperationsPanelProps {
  withoutOperation?: boolean;
}

const SidebarOperationsPanel: React.FC<SidebarOperationsPanelProps> = ({
  children,
  withoutOperation = true,
}: React.PropsWithChildren<SidebarOperationsPanelProps>) => {
  const classNames = ['sidebar-operations-panel'];
  if (withoutOperation) {
    classNames.push('sidebar-operations-panel_without-operation');
  }
  return <div className={classNames.join(' ')}>{children}</div>;
};

export default SidebarOperationsPanel;
