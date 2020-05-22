import React, { useRef } from 'react';
import './Modal.scss';
import { useInsideClick } from '../../hooks';
import { ModalStateToPropsMapResult, ModalDispatchToPropsMapResult } from './ModalConnected';

interface ModalProps extends ModalStateToPropsMapResult, ModalDispatchToPropsMapResult {}

const Modal: React.FC<ModalProps> = ({ title, body, isOpened, closeModal }: ModalProps) => {
  const modalRef = useRef(null);

  useInsideClick(modalRef, (event: MouseEvent): void => {
    if (event.target === modalRef.current) {
      closeModal();
    }
  });

  if (!isOpened) {
    return null;
  }

  return (
    <div ref={modalRef} className="modal">
      <div className="modal-content">
        <div className="modal-content__header">
          <h2>{title}</h2>
          <span className="modal-close" onClick={closeModal}>
            &times;
          </span>
        </div>
        <div className="modal-content__body">{body}</div>
      </div>
    </div>
  );
};

export default Modal;
