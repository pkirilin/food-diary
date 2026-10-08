import { Typography } from '@mui/material';
import { type FC } from 'react';
import { type GetWeightLogsRequest } from '@/entities/weightLog';
import { dateLib } from '@/shared/lib';
import { PageContainer } from '@/shared/ui';
import { WeightChart } from '@/widgets/WeightChart';
import { WeightLogsList } from '@/widgets/WeightLogsList';

interface Props {
  weightLogsRequest: GetWeightLogsRequest;
}

export const WeightPage: FC<Props> = ({ weightLogsRequest }) => {
  const from = dateLib.formatToUserFriendlyString(weightLogsRequest.from);
  const to = dateLib.formatToUserFriendlyString(weightLogsRequest.to);

  return (
    <PageContainer>
      <Typography variant="h6" component="h1">
        {from} — {to}
      </Typography>
      <WeightChart weightLogsRequest={weightLogsRequest} />
      <WeightLogsList weightLogsRequest={weightLogsRequest} />
    </PageContainer>
  );
};
