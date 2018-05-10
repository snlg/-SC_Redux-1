const hackSyncWechatTitle = () => {
  var iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = '/favicon.ico'
  iframe.onload = () => {
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 10)
  }
  document.body.appendChild(iframe)
}

const setTitle = (title) => {
  document.title = title || 'Hello Redux'
  if (document.title && (userAgent.device.isIOS)) {
    hackSyncWechatTitle()
  }
}
export {
  setTitle
}