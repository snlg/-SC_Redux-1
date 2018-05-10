import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import assign from 'lodash/assign'
// import reducer from 'reducers/'

class IndexContainer extends Component {
  componentWillMount () {
  }
  componentDidMount () {
    const combineReducers = (reducers) => {
      // 第一次筛选，参数reducers为Object
      // 筛选掉reducers中不是function的键值对
      var reducerKeys = Object.keys(reducers);
      var finalReducers = {}
      for (var i = 0; i < reducerKeys.length; i++) {
        var key = reducerKeys[i];
        if (typeof reducers[key] === 'function') {
          finalReducers[key] = reducers[key]
        }
      }

      var finalReducerKeys = Object.keys(finalReducers)

      // 二次筛选，判断reducer中传入的值是否合法（!== undefined）
      // 获取筛选完之后的所有key
      var sanityError
      try {
        // assertReducerSanity函数用于遍历finalReducers中的reducer，检查传入reducer的state是否合法
        assertReducerSanity(finalReducers)
      } catch (e) {
        sanityError = e
      }

      // 返回一个function。该方法接收state和action作为参数
      return function combination(state = {}, action) {
        // 如果之前的判断reducers中有不法值，则抛出错误
        if (sanityError) {
          throw sanityError
        }
        // 如果不是production环境则抛出warning
        // if (process.env.NODE_ENV !== 'production') {
        //   // var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action)
        //   // if (warningMessage) {
        //   //   warning(warningMessage)
        //   // }
        // }

        var hasChanged = false
        var nextState = {}
        // 遍历所有的key和reducer，分别将reducer对应的key所代表的state，代入到reducer中进行函数调用
        for (var i = 0; i < finalReducerKeys.length; i++) {
          var key = finalReducerKeys[i]
          var reducer = finalReducers[key]
          // 这也就是为什么说combineReducers黑魔法--要求传入的Object参数中，reducer function的名称和要和state同名的原因
          var previousStateForKey = state[key]
          // debugger
          var nextStateForKey = reducer(previousStateForKey, action)
          // 如果reducer返回undefined则抛出错误
          if (typeof nextStateForKey === 'undefined') {
            var errorMessage = getUndefinedStateErrorMessage(key, action)
            throw new Error(errorMessage)
          }
          // 将reducer返回的值填入nextState
          nextState[key] = nextStateForKey
          // 如果任一state有更新则hasChanged为true
          hasChanged = hasChanged || nextStateForKey !== previousStateForKey
        }
        return hasChanged ? nextState : state
      }
    }
    // 检查传入reducer的state是否合法
    const assertReducerSanity = (reducers) => {
      Object.keys(reducers).forEach(key => {
        var reducer = reducers[key]
        // 遍历全部reducer，并给它传入(undefined, action)
        // 当第一个参数传入undefined时，则为各个reducer定义的默认参数
        var initialState = reducer(undefined, { type: undefined })

        // ActionTypes.INIT几乎不会被定义，所以会通过switch的default返回reducer的默认参数。如果没有指定默认参数，则返回undefined，抛出错误
        if (typeof initialState === 'undefined') {
          throw new Error(
            `Reducer "${key}" returned undefined during initialization. ` +
            `If the state passed to the reducer is undefined, you must ` +
            `explicitly return the initial state. The initial state may ` +
            `not be undefined.`
          )
        }

        var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.')
        if (typeof reducer(undefined, { type }) === 'undefined') {
          throw new Error(
            `Reducer "${key}" returned undefined when probed with a random type. ` +
            `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
            `namespace. They are considered private. Instead, you must return the ` +
            `current state for any unknown actions, unless it is undefined, ` +
            `in which case you must return the initial state, regardless of the ` +
            `action type. The initial state may not be undefined.`
          )
        }
      })
    }
    const test1 = (state = null, action) => {
      switch (action.type) {
        case 'test1':
          return { ...state, test1: true }
        case '-test1':
          return { ...state, test1: false }
      }
      return state
    }
    const test2 = (state = null, action) => {
      switch (action.type) {
        case 'test2':
          return { ...state, test2: false }
        case '-test2':
          return { ...state, test2: false }
      }
      return state
    }
    const test3 = (state = null, action) => {
      switch (action.type) {
        case 'test3':
          return { ...state, test3: true }
        case '-test3':
          return { ...state, test3: false }
      }
      return state
    }
    let reducer = combineReducers({
      test1,
      test2,
      test3
    })
    // 发送异步action的中间件
    const thunkMiddleware = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('thunk middleware start')
        typeof action === 'function' ?
          action(dispatch, getState) :
          next(action);
        console.warn('thunk middleware end')
      }
    }
    // 传入多个middleware
    const middlewareA = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('A middleware start')
        next(action)
        console.warn('A middleware end')
      }
    }
    // 传入多个middleware
    const middlewareB = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('B middleware start')
        next(action)
        console.warn('B middleware end')
      }
    }
    // 传入多个middleware
    const middlewareC = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('C middleware start')
        next(action)
        console.warn('C middleware end')
      }
    }
    const applyMiddleware = (...middlewares) => {
      // 最终返回一个以createStore为参数的匿名函数
      // 这个函数返回另一个以reducer, initialState, enhancer为参数的匿名函数
      return (createStore) => (reducer, initialState, enhancer) => {
        var store = createStore(reducer, initialState, enhancer)
        var dispatch
        var chain = []
        var middlewareAPI = {
          getState: store.getState,
          dispatch: (action) => dispatch(action)
        }
        // 每个 middleware 都以 middlewareAPI 作为参数进行注入，返回一个新的链。
        // 此时的返回值相当于调用 thunkMiddleware 返回的函数： (next) => (action) => {} ，接收一个next作为其参数
        chain = middlewares.map(middleware => middleware(middlewareAPI))
        console.warn(`chain[0]::${chain[0]}`)
        // 并将链代入进 compose 组成一个函数的调用链
        dispatch = compose(...chain)(store.dispatch)
        // middlewares = [MC1, MC2, MC3]
        // dispatch = MC1(MC2(MC3(store.dispatch)))
        console.warn(`dispatch:: ${dispatch}`)
        console.warn(`store:: ${JSON.stringify(store)}`)
        return {
          ...store,
          dispatch
        }
      }
    }
    const compose = (...args) => {
      let length = args.length
      let count = length - 1
      let result
      let this_ = this
      return function f1(...arg1) {
        result = args[count].apply(this, arg1)
        if (count <= 0) {
          count = length - 1
          return result
        }
        count--
        return f1.call(null, result)
      }
    }
    const createStore = (reducer, initialState) => {
      // internal variables
      const store = {};
      store.state = initialState;
      store.listeners = [];

      // api-subscribe
      store.subscribe = (listener) => {
        store.listeners.push(listener);
      };
      // api-dispatch
      store.dispatch = (action) => {
        store.state = reducer(store.state, action);
        store.listeners.forEach(listener => listener());
      };

      // api-getState
      store.getState = () => store.state;

      return store;
    }

    let step = [ middlewareA, middlewareB, middlewareC]
    const finalCreateStore = applyMiddleware(...step)
    // finalCreateStore 为一个以createStore为参数的匿名函数
    // console.warn(`finalCreateStore::${finalCreateStore}`)
    const stepStore = finalCreateStore(createStore)
    // stepStore 为一个以reducer, initialState, enhancer为参数的匿名函数
    // console.warn(`stepStore::${stepStore}`)
    // console.warn(`reducer::${reducer}`)
    const store = stepStore(reducer)

    // console.warn(`store::${store}`)
    store.subscribe(() =>
      console.warn(store.getState())
    )
    // store.dispatch(setTimeout(() => {
    //   return {
    //     type: 'test1'
    //   }
    // }),2000)
    // // 1
    debugger
    store.dispatch({ type: 'test1' })
    // // 2
    // store.dispatch({ type: 'test3' })
    // store.dispatch({ type: '-test1' })
    // store.dispatch({ type: '-test2' })
    // store.dispatch({ type: '-test3' })
    // 1

  }
  render () {
    return (
      <div>
       'user'
      </div>
    )
  }
}

export default withRouter(IndexContainer)