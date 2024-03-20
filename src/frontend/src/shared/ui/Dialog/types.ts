import { type ButtonProps } from '@mui/material';
import { type ReactElement } from 'react';

type GetPropsFn = (propsOverrides: Partial<ButtonProps>) => ButtonProps;

export type RenderActionFn = (getProps: GetPropsFn) => ReactElement;

export interface DialogBaseProps {
  title: string;
  opened: boolean;
  content: ReactElement;
  onClose: () => void;
  renderSubmit: RenderActionFn;
}
