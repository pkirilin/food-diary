/**
 * Concats string of some number with singular or plural word, based on number's value. Examples:
 *
 * - getWordWithCount(1, 'apple', 'apples') === '1 apple'
 *
 * - getWordWithCount(5, 'apple', 'apples') === '5 apples'
 *
 * @param count Number of some thing
 * @param singularWord Singular word of some thing
 * @param pluralWord Plural word of some thing
 */
export function getWordWithCount(count: number, singularWord: string, pluralWord: string): string {
  if (count < 0) {
    throw new Error('Unable to get word by negative count');
  }

  return count === 1 ? `${count} ${singularWord}` : `${count} ${pluralWord}`;
}
