import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import { InputAdornment, TextField } from '@mui/material';
import { type FC } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { weightLogsApi } from '@/entities/weightLog';
import { useToggle } from '@/shared/hooks';
import { dateLib } from '@/shared/lib';
import { Button, Dialog } from '@/shared/ui';

interface Inputs {
  weight: number;
}

const formId = 'log-weight-form';

const weightSchema = z
  .string()
  .or(z.number())
  .transform(value => String(value).trim())
  .refine(value => /^\d+([.,]\d+)?$/.test(value), {
    message: "Must be a valid number with either '.' or ',' as decimal separator",
  })
  .transform(value => Number(value.replace(',', '.')))
  .pipe(z.coerce.number().gte(1).lte(500))
  .refine(value => !isNaN(value), { message: 'Must be a valid number' });

// TODO: add test
// Example usage
// const result = numberSchema.safeParse('123,4'); // Change to "123.4" for dot

// if (result.success) {
//   console.log('Validated number:', result.data); // Outputs: Validated number: 123.4
// } else {
//   console.log('Validation errors:', result.error.errors);
// }

// TODO: move to model
const schema = z.object({
  weight: weightSchema,
});

export const LogWeightButton: FC = () => {
  const [dialogVisible, toggleDialog] = useToggle();

  const { control, handleSubmit, formState } = useForm<Inputs>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      // TODO: fill with last logged weight value
      weight: 50,
    },
  });

  const [addWeightLog] = weightLogsApi.useAddMutation();

  const onSubmit: SubmitHandler<Inputs> = async ({ weight }) => {
    // TODO: add test
    const { error } = await addWeightLog({
      date: dateLib.formatToISOStringWithoutTime(new Date()),
      value: weight,
    });

    if (!error) {
      toggleDialog();
    }
  };

  // TODO: clear inputs on open/close

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
