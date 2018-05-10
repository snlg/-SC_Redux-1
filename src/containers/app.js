// 第三方依赖
import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import assign from 'lodash/assign'
// 业务 路由
import ROUTES from '../routers'

// 按需加载模块
import BundleComponent from 'components/common/lazyload'
import LoadingComponent from 'components/common/loading'

import { setTitle } from 'utils/bridgeApi'

const createComponent = (component, title, path) => () => (
  <BundleComponent load={component}>
    {
      (Component) => {
        return Component ? <Component /> : <LoadingComponent />
      }
    }
  </BundleComponent>
)

export default class AppContainer extends Component {
  render() {
    return <div>
      <Route render={(props) => {
        return <Switch>
          {ROUTES.map((item, i) => <Route key={i} {...props} {...assign({ exact: true }, item.option)} path={item.path} component={createComponent(item.page, item.title, item.path)} />)}
        </Switch>
      }} />
    </div>
  }
}
