import React from 'react';
import './CategoriesOperationsPanel.scss';
import { SidebarOperationsPanel } from '../SidebarBlocks';
import Loader from '../Loader';
import { CategoriesOperationsPanelStateToPropsMapResult } from './CategoriesOperationsPanelConnected';

type CategoriesOperationsPanelProps = CategoriesOperationsPanelStateToPropsMapResult;

const CategoriesOperationsPanel: React.FC<CategoriesOperationsPanelProps> = ({
  categoryOperationStatus,
}: CategoriesOperationsPanelProps) => {
  const { performing: isOperationInProcess, message: operationMessage } = categoryOperationStatus;

  return (
    <SidebarOperationsPanel>
      {isOperationInProcess ? <Loader size="small" label={operationMessage}></Loader> : 'No operation in process'}
    </SidebarOperationsPanel>
  );
};

export default CategoriesOperationsPanel;
