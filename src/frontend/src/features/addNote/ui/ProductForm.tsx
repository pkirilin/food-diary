import { TextField } from '@mui/material';
import { type FC } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/shared/ui';

const schema = z.object({
  name: z.string(),
});

export type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues: FormValues;
  onSubmit: (data: FormValues) => void;
}

export const ProductForm: FC<Props> = ({ defaultValues, onSubmit }) => {
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(data => onSubmit(data))}>
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Name"
            placeholder="Product name"
            margin="normal"
            helperText=" "
          />
        )}
      />
      <Button fullWidth variant="outlined" type="submit">
        Save
      </Button>
    </form>
  );
};
