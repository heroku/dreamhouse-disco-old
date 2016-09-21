export default function reducer(state={
  setup: {},
  fetching: false,
  fetched: false,
  setting: false,
  set: false,
  error: null
}, action) {
  switch (action.type) {
    case 'GET_SETUP': {
      return {...state, fetching: true, fetched: false}
    }
    case 'GET_SETUP_FULFILLED': {
      return {...state, fetching: false, fetched: true, setup: action.payload}
    }
    case 'GET_SETUP_REJECTED': {
      return {...state, fetching: false, error: action.payload}
    }
    case 'SET_SETUP': {
      return {...state, setting: true, set: false}
    }
    case 'SET_SETUP_FULFILLED': {
      return {...state, setting: false, set: true, setup: action.payload}
    }
    case 'SET_SETUP_REJECTED': {
      return {...state, setting: false, error: action.payload}
    }
    default: {
      return state
    }
  }
}
