import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import { InputAdornment, TextField } from '@mui/material';
import { useEffect, type FC } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { weightLogsApi } from '@/entities/weightLog';
import { useToggle } from '@/shared/hooks';
import { dateLib } from '@/shared/lib';
import { Button, Dialog } from '@/shared/ui';
import { type FormValues, schema } from '../model';

const formId = 'log-weight-form';
const defaultWeight = 70;

export const LogWeightButton: FC = () => {
  const [dialogVisible, toggleDialog] = useToggle();

  const { lastLoggedWeight } = weightLogsApi.useWeightLogsQuery(null, {
    selectFromResult: ({ data }) => ({
      lastLoggedWeight: data?.weightLogs[0]?.value ?? defaultWeight,
    }),
  });

  const { control, handleSubmit, formState, reset } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      weight: lastLoggedWeight,
    },
  });

  const [addWeightLog] = weightLogsApi.useAddMutation();

  const onSubmit: SubmitHandler<FormValues> = async ({ weight }) => {
    // TODO: add test
    const { error } = await addWeightLog({
      date: dateLib.formatToISOStringWithoutTime(new Date()),
      value: weight,
    });

    if (!error) {
      toggleDialog();
    }
  };

  useEffect(() => {
    if (!dialogVisible) {
      reset();
    }
  }, [dialogVisible, reset]);

  return (
    <>
      <Button startIcon={<AddIcon />} color="primary" variant="contained" onClick={toggleDialog}>
        Log weight
      </Button>
      <Dialog
        disableContentPaddingBottom
        renderMode="fullScreenOnMobile"
        title="Log weight"
        opened={dialogVisible}
        onClose={toggleDialog}
        content={
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="weight"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onFocus={event => {
                    event.target.select();
                  }}
                  label="Weight"
                  placeholder="Enter your weight"
                  margin="normal"
                  fullWidth
                  autoFocus
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message ?? ' '}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    },
                    htmlInput: {
                      type: 'text',
                      inputMode: 'decimal',
                    },
                  }}
                />
              )}
            />
          </form>
        }
        renderCancel={props => (
          <Button {...props} onClick={toggleDialog}>
            Cancel
          </Button>
        )}
        renderSubmit={props => (
          <Button
            {...props}
            type="submit"
            form={formId}
            disabled={!formState.isValid}
            loading={formState.isSubmitting}
          >
            Save
          </Button>
        )}
      />
    </>
  );
};
