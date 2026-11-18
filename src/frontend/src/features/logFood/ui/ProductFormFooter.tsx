import { Alert, AlertTitle, Button, Stack } from '@mui/material';
import { type FC } from 'react';
import { type ClientError } from '@/shared/api';

interface Props {
  formId: string;
  formError: ClientError | null;
  submitting: boolean;
  submitDisabled: boolean;
  submitLabel: string;
}

export const ProductFormFooter: FC<Props> = ({
  formId,
  formError,
  submitting,
  submitDisabled,
  submitLabel,
}) => (
  <>
    {formError && (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>{formError.title}</AlertTitle>
        {formError.message}
      </Alert>
    )}
    <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
      <Button
        type="submit"
        form={formId}
        variant="contained"
        loading={submitting}
        disabled={submitDisabled}
      >
        {submitLabel}
      </Button>
    </Stack>
  </>
);
