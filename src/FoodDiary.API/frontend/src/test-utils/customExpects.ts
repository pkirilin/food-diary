import { RenderResult, screen } from '@testing-library/react';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toContainPageItems: (...dates: string[]) => Promise<R>;
      toContainOptions: (...options: string[]) => R;
      toContainEmptyOptions: () => R;
    }
  }
}

type RtlScreen = typeof screen;

expect.extend({
  toContainPageItems: async (result: RenderResult, ...dates: string[]) => {
    for (const date of dates) {
      expect(await result.findByText(date)).toBeInTheDocument();
    }

    return { message: () => '', pass: true };
  },

  toContainOptions: (screen: RtlScreen, ...options: string[]) => {
    const elements = screen.getAllByRole('option');

    expect(elements).toHaveLength(options.length);

    elements.forEach((element, i) => {
      expect(element).toHaveTextContent(options[i]);
    });

    return { message: () => '', pass: true };
  },

  toContainEmptyOptions: (screen: RtlScreen) => {
    const options = screen.queryAllByRole('option');
    expect(options).toHaveLength(0);
    return { message: () => '', pass: true };
  },
});
