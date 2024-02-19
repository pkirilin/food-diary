import { type PropsWithChildren, type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppLoader } from './app/AppLoader';
import { createAppRouter } from './app/router';

const App: FC<PropsWithChildren> = ({ children }) => (
  <RouterProvider router={createAppRouter(children)} fallbackElement={<AppLoader />} />
);

export default App;
