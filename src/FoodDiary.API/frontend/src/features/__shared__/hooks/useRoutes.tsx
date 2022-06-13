import { Route, Routes } from 'react-router-dom';
import { Auth } from '../../auth/components';
import { PageContent, Pages } from '../../pages/components';
import { Products } from '../../products/components';
import { Categories } from '../../categories/components';

export default function useRoutes(isAuthenticated: boolean): React.ReactElement {
  return isAuthenticated ? (
    <Routes>
      <Route path="/" element={<Pages></Pages>}></Route>
      <Route path="/pages" element={<Pages></Pages>}></Route>
      <Route path="/pages/:id" element={<PageContent></PageContent>}></Route>
      <Route path="/products" element={<Products></Products>}></Route>
      <Route path="/categories" element={<Categories></Categories>}></Route>
    </Routes>
  ) : (
    <Routes>
      <Route path="/auth" element={<Auth></Auth>}></Route>
      {/* TODO: configure auth */}
    </Routes>
  );
}
