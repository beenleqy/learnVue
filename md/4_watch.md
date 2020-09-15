### watch

#### 初始化

1. 每一个 `watch` 的属性保存一个 `watch-watcher` 实例，属性 `key` 作为 `expOrFn` 传入 `Watcher` 中

2. 此时 `expOrFn` 作为非函数进行特殊处理, `getter` 保存了新函数

3. 进入 `get` ，处理 `target` 队列和 `Dep.target` 值，执行 `getter` 时，读取了 `data` 中值
   
4. 触发 `data get` ， `watch-watcher` 收集 `dep` ，`dep` 保存 `watch-watcher`
   
#### 源码

```js
// 只贴出了主要功能的代码，其他均已省略
// 初始化
function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    createWatcher(vm, key, handler);
    vm.$watch(expOrFn, handler, options)
  }
}

function createWatcher(vm, key, handler){
  // 根据用户传入的配置项取值 
  // name: { handler: () => {} } ==> handler
  // name: nameFn(){}  ==> nameFn
  // name: 'watchName' ==> vm.watchName
   return vm.$watch(expOrFn, handler, options)
 }


Vue.prototype.$watch = function ( expOrFn, cb, options ) {
    var vm = this;
    options = options || {};
    var watcher = new Watcher(vm, expOrFn, cb, options);
};

function Watcher( vm, expOrFn, cb, options ){
  if (typeof expOrFn === 'function') {
    // ...
  } else {
    this.getter = parsePath(expOrFn);
  }
  this.value = this.lazy ? undefined : this.get();
}

function parsePath (path) {
    // 包含特殊字符 return
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]]; // 这里读取vm上的属性，进入data get函数 进而收集依赖
      }
      return obj
    }
  }

Watcher.prototype.get = function get () {
  var value = this.getter.call(vm, vm); // 这里执行parsePath返回函数

  if (this.deep) {
    traverse(value); // 作深度监听
  }
};

function traverse (val) {
  // 递归 读取属性, 便于每个属性都保存到watch-watcher
  if(typeOf val !== 'object') return
  if (Array.isArray(val)) {
     i = val.length;
     while (i--) { traverse (val[i]); }
  } else {
    keys = Object.keys(val);
    i = keys.length;
    while (i--) { traverse (val[keys[i]]); }
  }
}

```

#### watch中的数据变化后过程

1. 进入`data set`时，通过更新

2. 保存并更新 `watcher.value` ，若新老 `value` 不同，将新老 `value` 作为参数，执行用户传入的 `watch` 方法

#### 总结

1. 初始化时生成一个 `watch-watcher` 实例

2. 获取 `watcher.value` 时，触发 `data get` 进行依赖收集，依赖添加监听

3. `data` 改变时通知更新，重新获取 `watcher.value` 执行用户传入的 `watch` 方法

