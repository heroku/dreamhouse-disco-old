import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import account from './accountReducer'
import music from './musicReducer'
import setup from './setupReducer'

export default combineReducers({
      setup,
      account,
      music,
      routing: routerReducer
    })
