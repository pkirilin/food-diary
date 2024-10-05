import { getCurrentDate } from './date';

describe('getCurrentDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('should return current date without time', () => {
    vi.useFakeTimers().setSystemTime(new Date('2024-10-05'));

    const today = getCurrentDate();

    expect(today.getFullYear()).toEqual(2024);
    expect(today.getMonth()).toEqual(9);
    expect(today.getDate()).toEqual(5);
    expect(today.getHours()).toEqual(0);
    expect(today.getMinutes()).toEqual(0);
    expect(today.getSeconds()).toEqual(0);
    expect(today.getMilliseconds()).toEqual(0);
  });
});
