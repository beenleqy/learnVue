### 合并

```js
function mergeOptions(parent, child, vm) {    
    // ...
    // 遍历mixins，parent 先和 mixins 合并，然后在和 child 合并
    if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
            parent = mergeOptions(parent, child.mixins[i], vm);
        }
    }
    var options = {}, key;    

    // 先处理 parent 的 key，
    for (key in parent) {
        mergeField(key);
    }    

    // 遍历 child 的key ，排除已经处理过的 parent 中的key
    for (key in child) {        
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
        }
    }    

    // 拿到相应类型的合并函数，进行合并字段，strats 请看下面
    function mergeField(key) {    
        // strats 保存着各种字段的处理函数，否则使用默认处理
        var strat = strats[key] || defaultStrat;    
        // 相应的字段处理完成之后，会完成合并的选项
        options[key] = strat(parent[key], child[key], vm, key);
    }    
    return options
}
```

总结：

1. 先遍历合并 `parent` 中的 `key`，保存在变量 `options`

2. 再遍历 `child` 合并补上 `parent` 中没有的 `key`，保存在变量 `options`
   
3. 优先处理 `mixins` ，递归处理，重复1，2

#### 关于strats

##### defaultStrats

优先使用组件的 `options`

组件 `options` > 组件 `mixin options` >全局 `options`

```js
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined ? parentVal: childVal
  }
```

##### data

1. 先执行两个函数，获取结果

2. 将两个结果合并组件的 `options`中 `data(){}` 执行结果中
   
```js
var mixins = {
  data(){
    return {
      obj: {
        name: 'mixin_name_obj',
        key: 'mixin_obj_key'
      }
      message: 'mixin_message'
    }
  },
}

new Vue({ 
  data(){
    return {
      obj: {
        name: 'self_name_obj',
      }
      self_mixin: 'self_mixin'
    }
  }
})

// strats.data 处理之后
{
  message: 'mixin_message', self_mixin: 'self_mixin',
  obj: {
    get name (){}, set name(){},
    get key (){}, set key(){},
  }
}
```

```js

strats.data = function ( parentVal, childVal ) {
  let res = mergeDataOrFn(parentVal, childVal)
  return res
};

// 将from中to不存在的属性合到to上, 属性值若为Object类型也将进行合并
function mergeData (to, from) {
  if (!from) { return to }

  var key, toVal, fromVal;
  var keys = Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i];
    toVal = to[key];
    fromVal = from[key];

    // 如果to不存在这个属性，赋值
    if (!hasOwn(to, key)) {
      if (Array.isArray(to)) {
        target.splice(key, 1, fromVal);
      }else{
         to[key] = fromVal
      }
    } else if ( toVal !== fromVal && ...(toVal、fromVal均为Object) ) {
      mergeData(toVal, fromVal);
    }
  }
  return to
}
function mergeDataOrFn ( parentVal, childVal ) {
  return function mergedInstanceDataFn () {
    var instanceData = childVal.call(vm, vm)
    var defaultData = parentVal.call(vm, vm)
    if (instanceData) {
      return mergeData(instanceData, defaultData)
    } else {
      return defaultData
    }
  }
}
```

##### provide

详细见 `data`

```js
strats.provide = mergeDataOrFn;
```

##### 钩子函数

把所有的钩子函数保存进数组

数组: [ `global_mixin_created(Vue.mixin)`, `mixin_mixin_created`, `mixin_created`, `组件_created`]

```js
  [ 'beforeCreate',  'created', 'beforeMount', 'mounted',
    'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed',
    'activated', 'deactivated', 'errorCaptured', 'serverPrefetch'
  ].forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  function mergeHook ( parentVal, childVal ) {
    /**
     * 为何不判断parentVal是否为数组呢？ parentVal初始值
     * mergeOptions > parent初始值(initGlobalAPI > Vue.options)
     * parent: { components, directives, filters, _base }  ==> parentVal: undefined；childVal会被改为数组
     */
    // childVal存在，parentVal存在，两者合并，parentVal不存在，将childVal改写成数组形式返回
    var res = childVal
      ? ( parentVal ? parentVal.concat(childVal) :( Array.isArray(childVal) ? childVal : [childVal] ) )
      : parentVal;
    return res ? dedupeHooks(res) : res
  }

  // 去重
  function dedupeHooks (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }
```

##### component、directives、filters

原型叠加 parent在child的原型上，这样的好处：同名不会被覆盖

```js
  [ 'component', 'directive', 'filter' ].forEach(function (type) {
    strats[ type +'s'] = mergeAssets;
  });

  function mergeAssets ( parentVal, childVal ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
        for(var key in childVal){
          res[key] = childVal[key]
        }
    } else {
      return res
    }
  }
```

##### watch

首先将parent上的拷到一个新对象上，child与parent相同的属性合到数组中

```js
   strats.watch = function ( parentVal, childVal ) {
    
    if (!childVal) { 
      return Object.create(parentVal || null) 
    }

    if (!parentVal) { 
      return childVal 
    }
    var ret = {};

    for(var key in parentVal){
      ret[key] = parentVal[key]
    }

    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent ? parent.concat(child) : (Array.isArray(child) ? child : [child]);
    }
    return ret
  };
```

##### props、methods、inject、computed

同名属性会被覆盖, `child` 覆盖 `parent`

```js
  strats.props = strats.methods = strats.inject =
  strats.computed = function ( parentVal, childVal ) {
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend(ret, parentVal);
    if (childVal) { extend(ret, childVal); }
    return ret
  };

  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }
```