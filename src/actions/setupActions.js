import axios from 'axios'

export function getSetup() {
  return function(dispatch) {
    dispatch({ type: 'GET_SETUP' })
    return axios.get('/api/setup')
      .then((response) => {
        dispatch({ type: 'GET_SETUP_FULFILLED', payload: response.data })
      })
      .catch((err) => {
        dispatch({ type: 'GET_SETUP_REJECTED', payload: err })
      })
  }
}

export function setSetup(data) {
  return function(dispatch) {
    dispatch({ type: 'SET_SETUP' })
    return axios.patch('/api/setup', data)
      .then((response) => {
        dispatch({ type: 'SET_SETUP_FULFILLED', payload: response.data })
      })
      .catch((err) => {
        dispatch({ type: 'SET_SETUP_REJECTED', payload: err })
      })
  }
}
