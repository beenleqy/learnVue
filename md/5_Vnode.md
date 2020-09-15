### Vnode

#### 知识点储备

with 绑定大括号内代码的 变量访问作用域

```js

function test(){ with(this){ console.log(parentName) }}
// 等价于
function test(){ console.log(this.parentName }}
```

#### watch中的数据变化后过程

1. 进入`data set`时，通过更新

2. 保存并更新 `watcher.value` ，若新老 `value` 不同，将新老 `value` 作为参数，执行用户传入的 `watch` 方法

#### 总结

1. 初始化时生成一个 `watch-watcher` 实例

2. 获取 `watcher.value` 时，触发 `data get` 进行依赖收集，依赖添加监听

3. `data` 改变时通知更新，重新获取 `watcher.value` 执行用户传入的 `watch` 方法

