import { type ComponentType, type ReactElement } from 'react';

export interface NavLink {
  icon: ReactElement;
  title: string;
  path: string;
}

export type AppBarConfig = {
  variant: 'menu';
  title: string | { Component: ComponentType };
  Actions?: ComponentType;
};
