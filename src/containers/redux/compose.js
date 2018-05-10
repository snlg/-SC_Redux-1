import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import assign from 'lodash/assign'
import { router } from 'utils'

class UserContainer extends Component {
  componentWillMount() {
  }
  componentDidMount() {
    const compose = function (...args) {
      let length = args.length
      let count = length - 1
      let result
      let this_ = this
      // 递归
      return function f1(...arg1) {
        result = args[count].apply(this, arg1)
        if (count <= 0) {
          count = length - 1
          return result
        }
        count--
        return f1.call(null, result)
        // ???  为什么f1 执行的时候需要将this指向提升到window／global
      }
    }
    let init = (...args) => args.reduce((ele1, ele2) => ele1 + ele2, 0)
    let step2 = (val) => val + 2
    let step3 = (val) => val + 3
    let step4 = (val) => val + 4
    let steps = [step4, step3, step2, init]
    let composeFunc = compose(...steps)

    console.log(composeFunc(1, 2, 3))
  }
  render() {
    return (
      <div>
        'compose'
      </div>
    )
  }
}

export default withRouter(UserContainer)