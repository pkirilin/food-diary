import 'react-redux';
import { RootState } from '../store';

declare module 'react-redux' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultRootState extends RootState {}
}
