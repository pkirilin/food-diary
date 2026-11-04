// The TypeScript config leaves Node's types out, so this declares the part of node:buffer that
// the tests use
declare module 'node:buffer' {
  export const Blob: typeof globalThis.Blob;
  export const File: typeof globalThis.File;
}
