export default function reducer(state={
  account: {},
  fetching: false,
  fetched: false,
  error: null
}, action) {
  switch (action.type) {
    // case 'FETCH_ACCOUNT': {
    //   return {...state, fetching: true}
    // }
    // case 'FETCH_ACCOUNT_REJECTED': {
    //   return {...state, fetching: false, error: action.payload}
    // }
    // case 'FETCH_ACCOUNT_FULFILLED': {
    //   // call account_logged_in action here?
    //   return {...state, fetching: false, fetched: true, account: action.payload}
    // }
    case 'ACCOUNT_LOGGED_IN': {
      return {...state, account: action.payload}
    }
    case 'ACCOUNT_LOGGED_OUT': {
      return {...state, fetched: false, account: {}}
    }
    default: {
      return state;
    }
  }
}
