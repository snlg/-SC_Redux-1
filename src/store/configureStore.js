import Redux, { compose, createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'react-router-redux'
import ReduxThunk from 'redux-thunk'
import ReduxLogger from 'redux-logger'
import { router } from 'utils'
import reducer from 'reducers/'
import assign from 'lodash/assign'
const middleware = routerMiddleware(history)

export default function configureStore() {
  // let composeArray = [
  //   applyMiddleware(ReduxThunk),
  //   applyMiddleware(middleware),
  //   applyMiddleware(ReduxLogger)
  // ]
  //let finalCreateStore = compose.apply(Redux, composeArray)(createStore)
  // let finalCreateStore = compose(...composeArray)(createStore)
  // let store = finalCreateStore(reducer)
 
  // let composeFun = compose(...step)
  
  let step = [ReduxThunk, middleware, ReduxLogger]
  let store = applyMiddleware(...step)(createStore)(reducer)

  return store
  // function thunkMiddleware({ dispatch, getState }) {
  //   return next => action =>
  //     typeof action === 'function' ?
  //       action(dispatch, getState) :
  //       next(action);
  // }
  // function applyMiddleware(...middlewares) {
  //   return (next) => (reducer, initialState) => {
  //     var store = next(reducer, initialState);
  //     var dispatch = store.dispatch;
  //     var chain = [];

  //     var middlewareAPI = {
  //       getState: store.getState,
  //       dispatch: (action) => dispatch(action)
  //     };
  //     chain = middlewares.map(middleware => middleware(middlewareAPI));
  //     dispatch = compose(...chain)(store.dispatch);

  //     return {
  //       ...store,
  //       dispatch
  //     };
  //   };
  // }
  // const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore)
  // const store = finalCreateStore(reducer)
  // return store
}