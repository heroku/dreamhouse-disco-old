import axios from 'axios'

export function login(data) {
  localStorage.setItem('account', JSON.stringify(data))
  return {
    type: 'ACCOUNT_LOGGED_IN',
    payload: data
  }
}

export function logout() {
  localStorage.removeItem('account')
  return function(dispatch) {
    dispatch({type: 'BEGIN_LOGOUT'})
    return axios.get('/api/auth/logout')
      .then((response) => {
        dispatch({type: 'LOGOUT_FULFILLED'})
      })
      .catch((err) => {
        dispatch({type: 'LOGOUT_REJECTED', payload: err})
      })
  }
}
