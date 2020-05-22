import React from 'react';
import './App.scss';
import { createBrowserHistory } from 'history';
import { Router, Switch, Route, Redirect } from 'react-router-dom';
import Navbar from './components/Navbar';
import PagesConnected from './components/Pages';
import ProductsConnected from './components/Products';
import CategoriesConnected from './components/Categories';
import ModalConnected from './components/Modal/ModalConnected';

const history = createBrowserHistory();

const App: React.FC = () => {
  return (
    <Router history={history}>
      <ModalConnected></ModalConnected>
      <Navbar></Navbar>
      <Switch>
        <Route path="/pages" component={PagesConnected}></Route>
        <Route exact path="/products" component={ProductsConnected}></Route>
        <Route path="/categories" component={CategoriesConnected}></Route>
        <Redirect exact from="/" to="/pages"></Redirect>
      </Switch>
    </Router>
  );
};

export default App;
