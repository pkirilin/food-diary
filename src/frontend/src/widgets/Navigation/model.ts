import { type ComponentType } from 'react';

export type AppBarConfig = {
  variant: 'menu';
  title: string | { Component: ComponentType };
  Actions?: ComponentType;
};
