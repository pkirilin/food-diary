import { type WeightLogItem } from '@/entities/weightLog';
import { dateLib } from '@/shared/lib';

export const getNextWeightLogDate = (weightLogs: WeightLogItem[]): Date => {
  const today = dateLib.getCurrentDate();

  if (weightLogs.length === 0) {
    return today;
  }

  const lastLoggedOn = weightLogs[0].date;
  const daysSinceLastLog = dateLib.differenceInDays(today, lastLoggedOn);

  if (daysSinceLastLog < 0) {
    return dateLib.addDays(lastLoggedOn, 1);
  }

  if (daysSinceLastLog > 0) {
    return today;
  }

  return dateLib.addDays(today, 1);
};
