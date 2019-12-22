import React from 'react';
import App from './App';
import { shallow } from 'enzyme';

describe('App component', () => {
  it('should render without crashing', () => {
    shallow(<App></App>);
  });
});
