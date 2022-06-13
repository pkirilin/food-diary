import { Redirect, Route, Switch } from 'react-router-dom';
import { Auth } from '../../auth/components';
import { PageContent, Pages } from '../../pages/components';
import { Products } from '../../products/components';
import { Categories } from '../../categories/components';

export default function useRoutes(isAuthenticated: boolean): React.ReactElement {
  return isAuthenticated ? (
    <Switch>
      <Route exact path="/pages">
        <Pages></Pages>
      </Route>
      <Route exact path="/pages/:id">
        <PageContent></PageContent>
      </Route>
      <Route exact path="/products">
        <Products></Products>
      </Route>
      <Route exact path="/categories">
        <Categories></Categories>
      </Route>
      <Redirect exact from="/" to="/pages"></Redirect>
      <Redirect to="/pages"></Redirect>
    </Switch>
  ) : (
    <Switch>
      <Route exact path="/auth">
        <Auth></Auth>
      </Route>
    </Switch>
  );
}
