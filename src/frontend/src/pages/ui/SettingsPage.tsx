import { FormControlLabel, FormHelperText, Stack, Switch } from '@mui/material';
import { type FC } from 'react';
import { useMultiItemFoodLoggingPreference } from '@/shared/lib';
import { PageContainer } from '@/shared/ui';

export const SettingsPage: FC = () => {
  const [multiItemFoodLoggingEnabled, setMultiItemFoodLoggingEnabled] =
    useMultiItemFoodLoggingPreference();

  return (
    <PageContainer>
      <Stack>
        <FormControlLabel
          label="Log several foods at once"
          control={
            <Switch
              checked={multiItemFoodLoggingEnabled}
              onChange={event => {
                setMultiItemFoodLoggingEnabled(event.target.checked);
              }}
              slotProps={{ input: { 'aria-describedby': 'multi-item-food-logging-hint' } }}
            />
          }
        />
        <FormHelperText id="multi-item-food-logging-hint">Stored on this device</FormHelperText>
      </Stack>
    </PageContainer>
  );
};
