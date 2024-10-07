import { type WeightLogItem } from '@/entities/weightLog';
import { dateLib } from '@/shared/lib';
import { getNextWeightLogDate } from './getNextWeightLogDate';

const currentDateAsString = '2024-10-05';
const currentDate = new Date(currentDateAsString);

beforeEach(() => {
  vi.spyOn(dateLib, 'getCurrentDate').mockReturnValue(currentDate);
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('should return current date if weight logs are empty', () => {
  const weightLogs: WeightLogItem[] = [];

  const nextWeightLogDate = getNextWeightLogDate(weightLogs);

  expect(nextWeightLogDate).toEqual(currentDate);
});

test('should return today if last weight has been logged in the past', () => {
  const weightLogs: WeightLogItem[] = [{ date: '2024-10-04', value: 71 }];

  const nextWeightLogDate = getNextWeightLogDate(weightLogs);

  expect(nextWeightLogDate).toEqual(currentDate);
});

test('should return tomorrow if last weight has been logged today', () => {
  const weightLogs: WeightLogItem[] = [{ date: currentDateAsString, value: 71 }];

  const nextWeightLogDate = getNextWeightLogDate(weightLogs);

  expect(nextWeightLogDate).toEqual(new Date('2024-10-06'));
});

test('should return next day from last log if last weight has been logged in the future', () => {
  const weightLogs: WeightLogItem[] = [
    { date: '2024-10-06', value: 71 },
    { date: '2024-10-05', value: 71 },
  ];

  const nextWeightLogDate = getNextWeightLogDate(weightLogs);

  expect(nextWeightLogDate).toEqual(new Date('2024-10-07'));
});
