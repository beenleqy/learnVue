### computed

#### 初始化

1. 每一个 `computed` 的属性保存 一个 `watcher` 实例

2. 通过 `Object.defineProperty` 将 `computed` 代理到 `vm` 上

3. 设置 `get` 函数，函数内部：获取保存的 `watcher` ；判断是否重新计算 `computed` ; 若存在 `Dep.target` 则收集 `computed` 中的依赖；返回 `watcher.value` 即计算后的属性
   
#### 源码

```js
// 只贴出了主要功能的代码，其他均已省略
// 入口
function initMixin (Vue) {
  Vue.prototype._init = function (options) {
     var vm = this;
     initState(vm);
  }
}

function initState (Vue) {
  if (opts.computed) { initComputed(vm, opts.computed); }
}

// 初始化
function initComputed (vm, computed) {
  var watchers = vm._computedWatchers = Object.create(null);
  var getter = typeof userDef === 'function' ? userDef : userDef.get;
  for (var key in computed) {
    var userDef = computed[key];
    watchers[key] = new Watcher( vm, getter || ()=>{}, ()=>{}, { lazy: true } );
  
    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } 
  }
}

// 代理
function defineComputed ( target, key, userDef ) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: createComputedGetter(key),
    set: userDef.set || () => {}  // 若用户设置了就使用设置的
  });
}

// get函数封装
function createComputedGetter(key) {
  return function computedGetter() {
    var watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      // 重新计算 computed
      if (watcher.dirty) {
        watcher.evaluate();
      }
      // 将computed Watcher中的依赖 添加到render Watcher中
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value
    }
  }
}
```

#### 页面渲染computed到数据变更详细过程

##### 页面渲染computed

1. 页面挂载`$mount`时，实例化一个 `render Watcher` ，将 `render watcher` 保存到 `target` 队列中和 `Dep.target` 上，开始页面渲染

2. 渲染时，遇到 `computed` 进行读取， 读取时执行 `get` 函数

3. 获取 `computed` 初始化时保存的 `watcher` , 执行计算函数，将 `computed watcher` 保存到 `target` 队列中和 `Dep.target` 上

4. 执行用户传入的计算函数，读取到 `data` 上的属性，进入 `data` 属性上的 `get` 函数中，此时 `Dep.target` 为 `computed watcher` ，`computed watcher` 收集此 `data` 依赖(`dep`)，此依赖(`dep`)同时保存了 `computed watcher`

5. 收集完并得到执行结果，将 `computed watcher` 从 `target` 队列中移除，`Dep.target` 指向 `target` 队列中最后一个 `watcher` (`render watcher`), 将计算结果保存到 `computed watcher` 的 `value` 上

6. `render watcher` 逐一获取 `computed watcher` 收集的依赖(`dep`)，依赖(`dep`)同时保存 `render watcher`
 
  即通过`computed watcher` 将 `render watcher` 和 `data dep` 建立了联系

7. 返回 `computed watcher` 的 `value` 渲染到页面上

##### 数据变更

1. `computed` 中依赖的数据发生了变化，执行 `data` 属性上的 `set` 函数，观察新数据，通知依赖

2. 取出依赖中的 `watcher` , 首先是 `computed watcher` 判断是否为缓存 `watcher` 

3. 是，改变控制缓存的值，等执行到 `render watcher` 时重新计算

4. 否 按照渲染步骤，重新执行一遍

#### 涉及问题

#### computed 什么时候计算的？

`initComputed` 初始化 `computed watcher` 时，`watcher.value = undefined` 此时并没有计算值, 而是在读取 `computed` ，调用 `createComputedGetter` 才开始计算

##### computed 和 watcher 之间的联系？

1. `watcher.getter` 保存 `computed` 函数
   
2. `watcher.lazy` 开启缓存，即此 `watcher` 需要缓存，保存传入的 `lazy` 参数，不可更改，因此不可控制缓存

3. `watcher.dirty` 控制 `computed` 是否重新计算

4. `watcher.value` 保存 `computed` 函数结果

#### 总结

页面( P )展示 `computed` ( C ), C中涉及到 `data` ( D )

1. P读取C时，C收集了D相关依赖，D同时保存C

2. 通过C将P和D建立了连接，P收集D, D保存了C

3. D改变时逐一取出保存的[C, P]

4. C只改变 `dirty` 属性，说明缓存结果失效，P重新读取C时，再计算C的值