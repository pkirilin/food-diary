import { type ComponentType } from 'react';

export type Title = string | { Component: ComponentType };

export type AppBarConfig =
  | { variant: 'menu'; title: Title; Actions?: ComponentType }
  | { variant: 'back'; title: Title; Actions?: ComponentType }
  | { variant: 'search'; Search: ComponentType; Actions?: ComponentType };
