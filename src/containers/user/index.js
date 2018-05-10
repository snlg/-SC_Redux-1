import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import assign from 'lodash/assign'
import { router } from 'utils'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as userActions from 'actions/test.js'

class UserContainer extends Component {
  componentWillMount () {
  }
  componentDidMount () {
  }
  render () {
    return (
      <div>
        'user'
        <div style={{width:100, height:100,background:'red'}} onClick={() => {
            router.push('/done')
        }}></div>
        <div style={{ width: 100, height: 100, background: 'blue' }} onClick={() => this.test()}>
          2222
        </div>
        <div style={{ width: 100, height: 100, background: 'blue' }} onClick={() => this.test3()}>
          333
        </div>
      </div>
    )
  }
  test () {
    this.props.actions.test()
  }
  test3 () {
    setTimeout(() => {
      this.props.actions.test()
    },2000)
  }
}

function mapStateToProps(state, ownProps) {
  return {
    test: state.OrderListPage && state.OrderListPage.test
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(assign({}, userActions), dispatch)
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserContainer))