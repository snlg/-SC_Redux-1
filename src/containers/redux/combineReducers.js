import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import assign from 'lodash/assign'
import { router } from 'utils'

class UserContainer extends Component {
  componentWillMount() {
  }
  componentDidMount() {
    function combineReducers(reducers) {
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
        if (process.env.NODE_ENV !== 'production') {
          var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action)
          if (warningMessage) {
            warning(warningMessage)
          }
        }

        var hasChanged = false
        var nextState = {}
        // 遍历所有的key和reducer，分别将reducer对应的key所代表的state，代入到reducer中进行函数调用
        for (var i = 0; i < finalReducerKeys.length; i++) {
          var key = finalReducerKeys[i]
          var reducer = finalReducers[key]
          // 这也就是为什么说combineReducers黑魔法--要求传入的Object参数中，reducer function的名称和要和state同名的原因
          var previousStateForKey = state[key]
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
    function assertReducerSanity(reducers) {
      Object.keys(reducers).forEach(key => {
        var reducer = reducers[key]
        // 遍历全部reducer，并给它传入(undefined, action)
        // 当第一个参数传入undefined时，则为各个reducer定义的默认参数
        var initialState = reducer(undefined, { type: ActionTypes.INIT })

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
    const OrderListPage = (state = null, action) => {
      switch (action.type) {
        case 'test':
          return { ...state, test: 1 }
      }
      return state
    }
    const test = (state = null, action) => {
      switch (action.type) {
        case '222test':
          return { ...state, test: 1 }
      }
      return state
    }
    console.warn(combineReducers({
      test,
      OrderListPage
    }))
  }
  render() {
    return (
      <div>
        'combineReducers'
      </div>
    )
  }
}

export default withRouter(UserContainer)