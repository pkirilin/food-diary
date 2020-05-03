export function getWordWithCount(count: number, singularWord: string, pluralWord: string): string {
  if (count < 0) {
    throw new Error('Unable to get word by negative count');
  }

  return count === 1 ? `${count} ${singularWord}` : `${count} ${pluralWord}`;
}
