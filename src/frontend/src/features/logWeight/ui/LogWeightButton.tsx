import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import { InputAdornment, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, type FC, useMemo } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { type GetWeightLogsRequest, weightLogsApi } from '@/entities/weightLog';
import { useToggle } from '@/shared/hooks';
import { dateLib } from '@/shared/lib';
import { Button, Dialog } from '@/shared/ui';
import { type FormValues, schema } from '../model';
import { getNextWeightLogDate } from '../model/getNextWeightLogDate';

const formId = 'log-weight-form';
const defaultWeight = 70;

interface Props {
  weightLogsRequest: GetWeightLogsRequest;
}

export const LogWeightButton: FC<Props> = ({ weightLogsRequest }) => {
  const [dialogVisible, toggleDialog] = useToggle();

  const { lastLoggedWeight, weightLogs } = weightLogsApi.useWeightLogsQuery(weightLogsRequest, {
    selectFromResult: ({ data }) => ({
      lastLoggedWeight: data?.weightLogs[0]?.value ?? defaultWeight,
      weightLogs: data?.weightLogs ?? [],
    }),
  });

  const nextWeightLogDate = useMemo(() => getNextWeightLogDate(weightLogs), [weightLogs]);

  const { control, handleSubmit, formState, reset, setValue } = useForm<FormValues>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      date: nextWeightLogDate,
      weight: lastLoggedWeight,
    },
  });

  const [addWeightLog] = weightLogsApi.useAddMutation();

  const onSubmit: SubmitHandler<FormValues> = async ({ date, weight }) => {
    const { error } = await addWeightLog({
      date: dateLib.formatToISOStringWithoutTime(date),
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

  useEffect(() => {
    setValue('date', nextWeightLogDate);
    setValue('weight', lastLoggedWeight);
  }, [lastLoggedWeight, nextWeightLogDate, setValue]);

  return (
    <>
      <Button startIcon={<AddIcon />} color="primary" variant="contained" onClick={toggleDialog}>
        Log weight
      </Button>
      <Dialog
        renderMode="fullScreenOnMobile"
        title="Log weight"
        opened={dialogVisible}
        onClose={toggleDialog}
        content={
          <form id={formId} onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="date"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  {...field}
                  label="Date"
                  format={dateLib.DateFormat.UserFriendly}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error: !!fieldState.error,
                      helperText: fieldState.error?.message ?? ' ',
                    },
                  }}
                />
              )}
            />
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
