import { DateFormat, formatDate, formatDateStr, isDateStringValid } from '../date-utils';

const formatDateTestData = [
  {
    date: new Date('2020-10-20'),
    format: DateFormat.DashYMD,
    expectedResult: '2020-10-20',
  },
  {
    date: new Date('2020-10-20'),
    format: DateFormat.SlashDMY,
    expectedResult: '20/10/2020',
  },
];

const formatDateStrTestData = [
  {
    date: '2020-10-20',
    format: DateFormat.DashYMD,
    expectedResult: '2020-10-20',
  },
  {
    date: '2020-10-20',
    format: DateFormat.SlashDMY,
    expectedResult: '20/10/2020',
  },
];

const formatDateStrTestDataError = [
  {
    date: 'afsdgdfg',
    format: DateFormat.DashYMD,
    expectedResult: 'Unknown date',
  },
];

const isDateStringValidTestData = [
  {
    dateString: '2020-10-20',
    expectedResult: true,
  },
  {
    dateString: '',
    expectedResult: false,
  },
  {
    dateString: '   ',
    expectedResult: false,
  },
  {
    dateString: 'qwerty',
    expectedResult: false,
  },
];

describe('utils (date)', () => {
  describe('formatDate', () => {
    formatDateTestData.forEach(({ date, format, expectedResult }) => {
      test(`should return '${expectedResult}' for '${date}' in format '${format}'`, () => {
        const result = formatDate(date, format);

        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('formatDateStr', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    formatDateStrTestData.forEach(({ date, format, expectedResult }) => {
      test(`should return '${expectedResult}' for '${date}' in format '${format}'`, () => {
        const result = formatDateStr(date, format);

        expect(result).toEqual(expectedResult);
      });
    });

    formatDateStrTestDataError.forEach(({ date, format, expectedResult }) => {
      test(`should return '${expectedResult}' for invalid date '${date}' and log error to console`, () => {
        const consoleSpy = jest.spyOn(global.console, 'error').mockImplementation();

        const result = formatDateStr(date, format);

        expect(result).toEqual(expectedResult);
        expect(consoleSpy).toHaveBeenCalledWith(`Date '${date}' cannot be formatted`);
        consoleSpy.mockRestore();
      });
    });
  });

  describe('isDateStringValid', () => {
    isDateStringValidTestData.forEach(({ dateString, expectedResult }) => {
      test(`should return '${expectedResult}' for '${dateString}'`, () => {
        const result = isDateStringValid(dateString);

        expect(result).toEqual(expectedResult);
      });
    });
  });
});
