import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openMessageModal } from '../action-creators';
import { RootState } from '../store';

function useModalMessage(title: string, selector: (state: RootState) => string | undefined): void {
  const message = useSelector<RootState, string | undefined>(selector);
  const dispatch = useDispatch();

  useEffect(() => {
    if (message) {
      dispatch(openMessageModal(title, message));
    }
  }, [title, message, dispatch]);
}

export default useModalMessage;
