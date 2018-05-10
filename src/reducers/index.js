import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

const OrderListPage = (state = null, action) => {
  switch (action.type) {
    case 'test':
      return {...state, test:1}
  }
  return state
}

export default combineReducers({
  routing: routerReducer,
  OrderListPage
})