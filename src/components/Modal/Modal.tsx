import React, { useRef } from 'react';
import './Modal.scss';
import { useInsideClick } from '../../hooks';

interface ModalProps {
  title: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<ModalProps> = ({ title, isOpen, setIsOpen, children }: React.PropsWithChildren<ModalProps>) => {
  const modalRef = useRef(null);

  const closeModal = (): void => {
    setIsOpen(false);
  };

  useInsideClick(modalRef, (event: MouseEvent): void => {
    if (event.target == modalRef.current) {
      closeModal();
    }
  });

  if (!isOpen) {
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
        <div className="modal-content__body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
