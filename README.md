
# 浅析Redux源码

@(Redux)[|用法|源码]

**Redux** 由Dan Abramov在2015年创建的科技术语。是受2014年Facebook的Flux架构以及函数式编程语言Elm启发。很快，Redux因其简单易学体积小短时间内成为最热门的前端架构。

@[三大原则]
- **单一数据源** - 整个应用的`state`被储存在一棵`object tree`中，并且这个`object tree`只存在于唯一一个`store`中。所有数据会通过`store.getState()`方法调用获取.
- **State‘只读’ ** -  根据`State`只读原则，数据变更会通过`store,dispatch(action)`方法.
- **使用纯函数修改** -`Reducer`只是一些纯函数[^demo]，它接收先前的`state`和`action`，并返回新的`state`.

----------

[TOC]

## 准备阶段
### 柯里化函数（curry）
``` javascript
	//curry example
	const A  = (a) => {
		return (b) => {
			return a + b
		}
	}
```
通俗的来讲，可以用一句话概括柯里化函数：返回函数的函数.
优点: 避免了给一个函数传入大量的参数，将参数的代入分离开，更有利于调试。降低耦合度和代码冗余，便于复用.
### 代码组合（compose）
举个例子	
``` javascript
	let init = (...args) => args.reduce((ele1, ele2) => ele1 + ele2, 0)
    let step2 = (val) => val + 2
    let step3 = (val) => val + 3
    let step4 = (val) => val + 4
    let steps = [step4, step3, step2, init]
    let composeFunc = compose(...steps)
    console.log(composeFunc(1, 2, 3))
    // 1+2+3+2+3+4 = 15
```
接下来看下FP思想的compose的源码
``` javascript
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
      }
    }
```
通俗的讲: 从右到左执行函数，最右函数以arguments为参数，其余函数以上个函数结果为入参数执行。

优点: 通过这样函数之间的组合，可以大大增加可读性，效果远大于嵌套一大堆的函数调用，并且我们可以随意更改函数的调用顺序


## CombineReducers
### 作用
随着整个项目越来越大，`state`状态树也会越来越庞大，state的层级也会越来越深，由于`redux`只维护唯一的`state`，当某个`action.type`所对应的需要修改`state.a.b.c.d.e.f`时，我的函数写起来就非常复杂，我必须在这个函数的头部验证`state` 对象有没有那个属性。这是让开发者非常头疼的一件事。于是有了`CombineReducers`。我们除去源码校验函数部分，从最终返回的大的`Reducers`来看。
> **Note:** 
> - **FinalReducers** : 通过`=== 'function'`校验后的`Reducers`.
> - **FinalReducerKeys** :  `FinalReducers`的所有`key`
> （与入参`Object`的`key`区别:过滤了`value`不为`function`的值）
### 源码
``` javascript
      // 返回一个function。该方法接收state和action作为参数
      return function combination(state = {}, action) {
        var hasChanged = false
        var nextState = {}
        // 遍历所有的key和reducer，分别将reducer对应的key所代表的state，代入到reducer中进行函数调用
        for (var i = 0; i < finalReducerKeys.length; i++) {
          var key = finalReducerKeys[i]
          var reducer = finalReducers[key]
          // CombineReducers入参Object中的Value为reducer function，从这可以看出reducer function的name就是返回给store中的state的key。
          var previousStateForKey = state[key]
          // debugger
          var nextStateForKey = reducer(previousStateForKey, action)
          // 如果reducer返回undefined则抛出错误
          if (typeof nextStateForKey === 'undefined') {
            var errorMessage = getUndefinedStateErrorMessage(key, action)
            throw new Error(errorMessage)
          }
          // 将reducer返回的值填入nextState
          nextState[key] = nextStateForKey
          // 如果任一state有更新则hasChanged为true
          hasChanged = hasChanged || nextStateForKey !== previousStateForKey
        }
        return hasChanged ? nextState : state
      }
```
### 小结
`combineReducers`实现方法很简单，它遍历传入的`reducers`，返回一个新的`reducer`.该函数根据`State` 的`key` 去执行相应的子`Reducer`，并将返回结果合并成一个大的`State` 对象。

## CreateStore
### 作用
`createStore`主要用于`Store`的生成，我们先整理看下`createStore`具体做了哪些事儿。(这里我们看简化版代码)
### 源码（简化版）
```javascript
const createStore = (reducer, initialState) => {
	  // initialState一般设置为null，或者由服务端给默认值。
      // internal variables
      const store = {};
      store.state = initialState;
      store.listeners = [];
      // api-subscribe
      store.subscribe = (listener) => {
        store.listeners.push(listener);
      };
      // api-dispatch
      store.dispatch = (action) => {
        store.state = reducer(store.state, action);
        store.listeners.forEach(listener => listener());
      };
      // api-getState
      store.getState = () => store.state;
      
      return store;
    }
```
### 小结
源码角度，一大堆类型判断先忽略，可以看到声明了一系列函数，然后执行了`dispatch`方法，最后暴露了`dispatch`、`subscribe`……几个方法。这里`dispatch`了一个`init Action`是为了生成初始的`State`树。
## ThunkMiddleware
### 作用
首先，说`ThunkMiddleware`之前,也许有人会问，到底`middleware`有什么用？
这就要从`action`说起。在`redux`里，`action`仅仅是携带了数据的普通`js`对象。`action creator`返回的值是这个`action`类型的对象。然后通过`store.dispatch()`进行分发……

`action ---> dispatcher ---> reducers`
同步的情况下一切都很完美……
如果遇到异步情况，比如点击一个按钮，希望1秒之后显示。我们可能这么写:
```javascript
function (dispatch) {
        setTimeout(function () {
            dispatch({
                type: 'show'
            })
        }, 1000)
    }
```
这会报错，返回的不是一个`action`，而是一个`function`。这个返回值无法被`reducer`识别。

大家可能会想到，这时候需要在`action`和`reducer`之间架起一座桥梁……
当然这座桥梁就是`middleware`。接下来我们先看看最简单，最精髓的`ThunkMiddleware`的源码
### 源码
```javascript
const thunkMiddleware = ({ dispatch, getState }) => {
      return next => action => {
        typeof action === 'function' ?
          action(dispatch, getState) :
          next(action)
      }
    }
```
非常之精髓。。。我们先记住上述代码，引出下面的`ApplyMiddleware`
## ApplyMiddleware
### 作用
介绍`applyMiddleware`之前我们先看下项目中`store`的使用方法如下:
```javascript
  let step = [ReduxThunk, middleware, ReduxLogger]
  let store = applyMiddleware(...step)(createStore)(reducer)
  return store
```
通过使用方法可以看到有3处柯里化函数的调用，`applyMiddleware` 函数`Redux` 最精髓的地方，成功的让`Redux` 有了极大的可拓展空间，在`action` 传递的过程中带来无数的“副作用”，虽然这往往也是麻烦所在。 这个`middleware`的洋葱模型思想是从`koa`的中间件拿过来的，用图来表示最直观。
### 洋葱模型
![Image text](http://oy0oxkhrp.bkt.clouddn.com/%E6%B4%8B%E8%91%B1%E6%A8%A1%E5%9E%8B.png)
我们来看源码:
### 源码
```javascript
	const applyMiddleware = (...middlewares) => {
      return (createStore) => (reducer, initialState, enhancer) => {
        var store = createStore(reducer, initialState, enhancer)
        var dispatch
        var chain = []
        var middlewareAPI = {
          getState: store.getState,
          dispatch: (action) => dispatch(action)
        }
        // 每个 middleware 都以 middlewareAPI 作为参数进行注入，返回一个新的链。
        // 此时的返回值相当于调用 thunkMiddleware 返回的函数： (next) => (action) => {} ，接收一个next作为其参数
        chain = middlewares.map(middleware => middleware(middlewareAPI))
        // 并将链代入进 compose 组成一个函数的调用链
        dispatch = compose(...chain)(store.dispatch)
        return {
          ...store,
          dispatch
        }
      }
    }
```
`applyMiddleware`函数第一次调用的时候，返回一个以`createStore`为参数的匿名函数,这个函数返回另一个以`reducer`,`initialState`,`enhancer`为参数的匿名函数.我们在使用方法中，分别可以看到传入的值。
结合一个简单的实例来理解中间件以及洋葱模型
```javascript
	// 传入middlewareA
    const middlewareA = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('A middleware start')
        next(action)
        console.warn('A middleware end')
      }
    }
    // 传入多个middlewareB
    const middlewareB = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('B middleware start')
        next(action)
        console.warn('B middleware end')
      }
    }
    // 传入多个middlewareC
    const middlewareC = ({ dispatch, getState }) => {
      return next => action => {
        console.warn('C middleware start')
        next(action)
        console.warn('C middleware end')
      }
    }
```
当我们传入多个类似A，B，C的`middleware`到`applyMiddleware`后，调用
```javascript
dispatch = compose(...chain)(store.dispatch)
```
结合场景并且执行`compose`结果为：
```javascript
dispatch = middlewareA(middlewareB(middlewareC(store.dispatch)))
```
从中我们可以清晰的看到`middleware`函数中的`next`函数相互连接，这里体现了`compose` FP编程思想中代码组合的强大作用。再结合洋葱模型的图片，不难理解是怎么样的一个工作流程。

最后我们看结果，当我们触发一个`store.dispath`的时候进行分发。则会先进入`middlewareA`并且打印`A start `然后进入`next`函数，也就是`middlewareB`同时打印`B start`，然后触发`next`函数，这里的`next`函数就是`middlewareC`，然后打印`C start`,之后才处理`dispath`，处理完成后先打印`C end`,然后`B end`,最后`A end`。完成整体流程。
### 小结
-	`Redux applyMiddleware`机制的核心在于，函数式编程`（FP）`的`compose`组合函数，需将所有的中间件串联起来。
- 为了配合`compose`对单参函数的使用，对每个中间件采用`currying`的设计。同时，利用闭包原理做到每个中间件共享`Store`。(`middlewareAPI`的注入)

# Feedback & Bug Report
- github: [@同性交友网站][1]

----------
Thank you for reading this record. 


[^demo]: 纯函数，它不依赖于外部环境（例如：全局变量、环境变量）、不改变外部环境（例如：发送请求、改变DOM结构），函数的输出完全由函数的输入决定。 
比如 slice 和 splice，这两个函数的作用并无二致——但是注意，它们各自的方式却大不同，但不管怎么说作用还是一样的。我们说 slice 符合纯函数的定义是因为对相同的输入它保证能返回相同的输出。而 splice 却会嚼烂调用它的那个数组，然后再吐出来；这就会产生可观察到的副作用，即这个数组永久地改变了。可以看到，splice改变了原始数组，而slice没有。我们认为，slice不改变原来数组的方式更加“安全”。改变原始组数，是一种“副作用”。. 

  [1]: https://github.com/snlg

