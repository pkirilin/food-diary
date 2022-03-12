import { RenderResult, waitFor } from '@testing-library/react';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toContainPageItems: (...dates: string[]) => Promise<R>;
    }
  }
}

expect.extend({
  toContainPageItems: async (result: RenderResult, ...dates: string[]) => {
    await waitFor(async () => {
      for (const date of dates) {
        expect(await result.findByText(date)).toBeInTheDocument();
      }
    });

    return { message: () => '', pass: true };
  },
});
