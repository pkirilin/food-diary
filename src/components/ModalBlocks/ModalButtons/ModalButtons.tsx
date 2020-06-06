import React from 'react';
import './ModalButtons.scss';

const ModalButtons: React.FC = ({ children }: React.PropsWithChildren<unknown>) => {
  return <div className="modal-buttons">{children}</div>;
};

export default ModalButtons;
