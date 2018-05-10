import React, { PureComponent } from 'react'

export default class LoadingComponent extends PureComponent {
  render () {
    return (
      <div className='loading'>
        <img src='//lhc-image.oss-cn-beijing.aliyuncs.com/lhc/2017/06/15/300w_300h_802781497510185.gif' />
      </div>
    )
  }
}
