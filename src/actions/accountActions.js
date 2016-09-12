export function login(data) {
  return {
    type: 'ACCOUNT_LOGGED_IN',
    payload: data
  }
}

export function logout() {
  return {
    type: 'ACCOUNT_LOGGED_OUT'
  }
}
