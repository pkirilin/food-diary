import { getWordWithCount } from '../string-utils';

const getWordWithCountTestData = [
  {
    count: 0,
    singularWord: 'apple',
    pluralWord: 'apples',
    expectedResult: '0 apples',
  },
  {
    count: 1,
    singularWord: 'apple',
    pluralWord: 'apples',
    expectedResult: '1 apple',
  },
  {
    count: 2,
    singularWord: 'apple',
    pluralWord: 'apples',
    expectedResult: '2 apples',
  },
  {
    count: 12,
    singularWord: 'apple',
    pluralWord: 'apples',
    expectedResult: '12 apples',
  },
];

describe('utils (string)', () => {
  describe('getWordWithCount', () => {
    getWordWithCountTestData.forEach(({ count, singularWord, pluralWord, expectedResult }) => {
      test(`should return correct word for count = ${count}`, () => {
        const result = getWordWithCount(count, singularWord, pluralWord);

        expect(result).toEqual(expectedResult);
      });
    });

    [-1, -100].forEach(count => {
      test(`should throw exception on count = ${count}`, () => {
        expect(() => {
          getWordWithCount(count, '', '');
        }).toThrow('Unable to get word by negative count');
      });
    });
  });
});
