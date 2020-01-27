/* eslint-disable @typescript-eslint/explicit-function-return-type */

// For testing purposes
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
