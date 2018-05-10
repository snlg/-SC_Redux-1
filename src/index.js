// 第三方依赖库
// ui
import React from 'react'
import ReactDom from 'react-dom'
// redux
import { Provider } from 'react-redux'
    // 给增强后的store传入reducer
import configureStore from './store/configureStore'
const store = configureStore()
// router
import { Router } from 'react-router-dom'
import { router } from 'utils'

// 业务 部分
import AppContainer from 'containers/app'

const render = (Component) => {
  function renderPage () {
    ReactDom.render(
      <Provider store={store}>
        <Router history={router}>
          <Component />
        </Router>
      </Provider>,
      document.getElementById('app')
    )
  }
  renderPage()
}
render(AppContainer)
