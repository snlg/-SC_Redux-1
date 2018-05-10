import { PureComponent } from 'react'

export default class BundleComponent extends PureComponent {
  componentWillMount () {
    this.load(this.props)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.load !== this.props.load) {
      this.load(nextProps)
    }
  }
  load (props) {
    this.setState({
      mod: null
    })
    // console.warn(props.load)
    props.load((mod) => {
      // debugger
      // console.warn(mod.default)
      this.setState({
        mod: mod.default ? mod.default : mod
      })
    })
  }
  render () {
    if (!this.state.mod) return false
    return this.props.children(this.state.mod)
  }
}
