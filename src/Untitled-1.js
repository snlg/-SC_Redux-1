// curry example
const funcA = (a) => {
  return (b) => {
    return a + b
  }
}

// compose example
const compose = (f, g) => {
  return (x) => {
    return f(g(x))
  }
}
// 还可以再简洁点
const compose = (f, g) => (x) => f(g(x))
