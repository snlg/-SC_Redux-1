import UserContainers from 'containers/user'
import DoneContainers from 'containers/done'
import TolistContainers from 'containers/tolist'
import TestContainers from 'containers/test'
import ReduxYgReduxContainers from 'containers/redux/yg_redux'
import ReduxComposeContainers from 'containers/redux/compose'
import ReduxCombineContainers from 'containers/redux/combineReducers'

export default [
  {
    path: '/',
    page: UserContainers
  },
  {
    path: '/done',
    page: DoneContainers
  },
  {
    path: '/tolist',
    page: TolistContainers
  },
  {
    path: '/test',
    page: TestContainers
  },
  {
    path: '/redux/yg_redux',
    page: ReduxYgReduxContainers
  },
  {
    path: '/redux/compose',
    page: ReduxComposeContainers
  },
  {
    path: '/redux/combineReducers',
    page: ReduxCombineContainers
  }
]
