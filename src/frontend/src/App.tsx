import { type FC } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './app/router';

const App: FC = () => {
  return <RouterProvider router={createAppRouter()} />;
};

export default App;
