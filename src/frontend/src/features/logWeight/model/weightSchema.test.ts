import { weightSchema } from './weightSchema';

describe('weightSchema', () => {
  test.each<[string | number, boolean, number | undefined]>([
    ['', false, undefined],
    [' ', false, undefined],
    ['asd', false, undefined],
    ['0', false, undefined],
    ['1234', false, undefined],
    ['12a', false, undefined],
    ['12,', false, undefined],
    ['12.', false, undefined],
    ['12', true, 12],
    [12, true, 12],
    ['12,34', true, 12.34],
    ['12.34', true, 12.34],
  ])(`parse '%s' -> %s, %s`, (data, expectedSuccess, expectedData) => {
    const result = weightSchema.safeParse(data);

    expect(result.success).toBe(expectedSuccess);
    expect(result.data).toBe(expectedData);
  });
});
