import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import assign from 'lodash/assign'
import { router } from 'utils'

class UserContainer extends Component {
  componentWillMount() {
  }
  componentDidMount() {
    // const store = {
    //   state: {}, // 全局唯一的state，内部变量，通过getState()获取
    //   listeners: [], // listeners，用来诸如视图更新的操作
    //   dispatch: () => { }, // 分发action
    //   subscribe: () => { }, // 用来订阅state变化
    //   getState: () => { }, // 获取state
    // }
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
    // reducer
    function counter(state = 0, action) {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        case 'DECREMENT':
          return state - 1
        default:
          return state
      }
    }

    let store = createStore(counter, 10)

    store.subscribe(() =>
      console.warn(store.getState())
    )


    store.dispatch({ type: 'INCREMENT' })
    // 1
    store.dispatch({ type: 'INCREMENT' })
    // 2
    store.dispatch({ type: 'DECREMENT' })
    // 1
  }
  render() {
    return (
      <div>
        'yg_redux'
      </div>
    )
  }
}

export default withRouter(UserContainer)