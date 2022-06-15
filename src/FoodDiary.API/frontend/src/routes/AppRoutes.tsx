import { Navigate, Route, Routes } from 'react-router-dom';
import { Auth, RequireAuth } from 'src/features/auth/components';
import { PageContent, Pages } from 'src/features/pages/components';
import { Products } from 'src/features/products/components';
import { Categories } from 'src/features/categories/components';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth></Auth>}></Route>
      <Route path="/" element={<Navigate to="/pages"></Navigate>}></Route>
      <Route
        path="/pages"
        element={
          <RequireAuth>
            <Pages></Pages>
          </RequireAuth>
        }
      ></Route>
      <Route
        path="/pages/:id"
        element={
          <RequireAuth>
            <PageContent></PageContent>
          </RequireAuth>
        }
      ></Route>
      <Route
        path="/products"
        element={
          <RequireAuth>
            <Products></Products>
          </RequireAuth>
        }
      ></Route>
      <Route
        path="/categories"
        element={
          <RequireAuth>
            <Categories></Categories>
          </RequireAuth>
        }
      ></Route>
    </Routes>
  );
}
