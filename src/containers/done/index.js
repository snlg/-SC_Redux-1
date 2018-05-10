import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import assign from 'lodash/assign'

class DoneContainer extends Component {
  componentWillMount () {
  }
  render () {
    return (
      <div>
       'done'
      </div>
    )
  }
}

export default withRouter(DoneContainer)