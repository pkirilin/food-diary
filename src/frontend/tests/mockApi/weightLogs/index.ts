import { db } from '../db';
import data from './weightLogs.data.json';

export { handlers as weightLogsHandlers } from './weightLogs.handlers';

export const fillWeightLogs = (): void => {
  data.forEach(weightLog => {
    db.weightLog.create(weightLog);
  });
};
