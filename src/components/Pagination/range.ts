// TODO: argument checks, move to utils
const createNumericRange = (startNumber: number, endNumber: number): number[] => {
  const range = new Array<number>();
  let currentNumber = startNumber - 1;
  for (let i = 0; i < endNumber - startNumber + 1; i++) {
    range.push(++currentNumber);
  }
  return range;
};

export default createNumericRange;
