import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, hashHistory, NoMatch } from 'react-router';
import { syncHistoryWithStore, routerActions } from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'

import App from './components/App';
import Music from './components/Music';
import Setup from './components/Setup';
import Auth from './components/Auth';
import Thanks from './components/Thanks';
import Logout from './components/Logout';
import store from './store'



import './style.css';

const history = syncHistoryWithStore(hashHistory, store);

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.account.account,
  failureRedirectPath: '/',
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated'
})

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={App}/>
      <Route path="/auth" component={Auth}/>
      <Route path="/music" component={UserIsAuthenticated(Music)}/>
      <Route path="/setup" component={UserIsAuthenticated(Setup)}/>
      <Route path="/thanks" component={Thanks}/>
      <Route path="/logout" component={Logout}/>
      <Route path="*" component={NoMatch}/>
    </Router>
  </Provider>,
  document.getElementById('root')
);
