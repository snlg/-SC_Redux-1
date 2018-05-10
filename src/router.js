// ui
import React from 'react'
import ReactDom from 'react-dom'

// router
import { Router, Switch } from 'react-router-dom'

// 基于createBrowserHistory创建history
import { router } from 'utils'


const render = () => {
  function renderPage() {
    ReactDom.render(
      <Router history={router}>
        <Route render={() => {
          return <Switch>
            <Route path='/' exact render={() => (<div>页面1</div>)}/>
            <Route path='/second' render={() => (<div>页面2</div>)}/>
          </Switch>
        }} />
      </Router>,
      document.getElementById('app')
    )
  }
  renderPage()
}

render()
