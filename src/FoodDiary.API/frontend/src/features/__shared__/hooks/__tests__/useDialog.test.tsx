import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import useDialog from '../useDialog';
import { Button, Dialog, DialogActions, DialogContent, DialogProps } from '@mui/material';
import { DialogCustomActionProps } from '../../types';

type TestDialogProps = DialogProps & DialogCustomActionProps<string>;

const TestDialog: React.FC<TestDialogProps> = ({
  onDialogCancel,
  onDialogConfirm,
  ...dialogProps
}: TestDialogProps) => {
  return (
    <Dialog {...dialogProps}>
      <DialogContent>Dialog content</DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onDialogConfirm('confirmed');
          }}
        >
          Confirm
        </Button>
        <Button
          onClick={() => {
            onDialogCancel();
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TestDialogWrapper: React.FC = () => {
  const [message, setMessage] = useState('');

  const dialog = useDialog<string>(data => {
    setMessage(data);
  });

  return (
    <React.Fragment>
      <span>Dialog status: {message || 'not confirmed'}</span>
      <button
        onClick={() => {
          dialog.show();
        }}
      >
        Show dialog
      </button>
      <TestDialog {...dialog.binding} />
    </React.Fragment>
  );
};

describe('useDialog hook', () => {
  describe('when result binded to dialog component', () => {
    test('should not show dialog', () => {
      // Act
      const { queryByText } = render(<TestDialogWrapper />);

      // Assert
      expect(queryByText('Dialog content')).not.toBeInTheDocument();
    });
  });

  describe('when result binded to dialog component and show button clicked', () => {
    test('should show dialog', () => {
      // Act
      const { getByText, queryByText } = render(<TestDialogWrapper />);
      fireEvent.click(getByText('Show dialog'));

      // Assert
      expect(queryByText('Dialog content')).toBeInTheDocument();
    });
  });

  describe('when result binded to dialog component and cancel button clicked', () => {
    test('should close dialog', () => {
      // Act
      const { getByText, queryByText } = render(<TestDialogWrapper />);
      fireEvent.click(getByText('Show dialog'));
      fireEvent.click(getByText('Cancel'));

      // Assert
      expect(queryByText('Dialog status: not confirmed')).toBeInTheDocument();
    });
  });

  describe('when result binded to dialog component and confirm button clicked', () => {
    test('should close dialog and set confirmation data', () => {
      // Act
      const { getByText, queryByText } = render(<TestDialogWrapper />);
      fireEvent.click(getByText('Show dialog'));
      fireEvent.click(getByText('Confirm'));

      // Assert
      expect(queryByText('Dialog status: confirmed')).toBeInTheDocument();
    });
  });
});
