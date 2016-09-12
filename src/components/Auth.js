import { Component, PropTypes } from 'react';
import { routerActions } from 'react-router-redux'
import { connect } from 'react-redux'

import { login } from '../actions/accountActions'

function select(store, ownProps) {
  const isAuthenticated = store.account || false
  const redirect = ownProps.location.query.redirect || '/music'
  const redirectToLogin = '/'
  return {
    isAuthenticated,
    redirect,
    redirectToLogin
  }
}

class Auth extends Component {

    static propTypes = {
      login: PropTypes.func.isRequired,
      replace: PropTypes.func.isRequired
    };

    componentWillMount() {
      const { isAuthenticated, replace, redirect, redirectToLogin } = this.props
      if (isAuthenticated) {
        replace(redirect)
      } else  {
        replace(redirectToLogin)
      }
    }

    componentWillReceiveProps(nextProps) {
      const { isAuthenticated, replace, redirect, redirectToLogin } = nextProps
      const { isAuthenticated: wasAuthenticated } = this.props

      if (!wasAuthenticated && isAuthenticated) {
        replace(redirect)
      } else  {
        replace(redirectToLogin)
      }
    }



    render() {
      this.props.login({
        id: this.props.location.query.id,
        name: this.props.location.query.name,
        number: this.props.location.query.number
      });
      return null
    }
}

export default connect(select, { login, replace: routerActions.replace })(Auth);
