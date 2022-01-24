import { Redirect, Route, Switch } from 'react-router-dom';
import { Auth } from '../../auth/components';
import { PageContent, Pages } from '../../pages/components';
import { Products } from '../../products/components';
import { Categories } from '../../categories/components';

export default function useRoutes(isAuthenticated: boolean): React.ReactElement {
  return isAuthenticated ? (
    <Switch>
      <Route exact path="/pages" component={Pages}></Route>
      <Route exact path="/pages/:id" component={PageContent}></Route>
      <Route exact path="/products" component={Products}></Route>
      <Route exact path="/categories" component={Categories}></Route>
      <Redirect exact from="/" to="/pages"></Redirect>
      <Redirect to="/pages"></Redirect>
    </Switch>
  ) : (
    <Switch>
      <Route exact path="/auth" component={Auth}></Route>
      <Redirect to="/auth"></Redirect>
    </Switch>
  );
}
