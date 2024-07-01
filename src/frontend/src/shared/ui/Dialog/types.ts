import { type ReactElement } from 'react';
import { type ButtonProps } from '../Button';

export type RenderActionFn = (props: ButtonProps) => ReactElement;

export interface DialogBaseProps {
  title: string;
  opened: boolean;
  content: ReactElement;
  disableContentPaddingTop?: boolean;
  disableContentPaddingBottom?: boolean;
  pinToTop?: boolean;
  onClose: () => void;
  renderSubmit: RenderActionFn;
}
