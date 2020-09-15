### initData

#### 准备

`Object.defineProperty`可以为对象中的属性设置`get`和`set`方法

当属性被访问时，会触发 `get` 函数

当属性被赋值时，会触发 `set` 函数

#### 主要功能

1. ` Object.defineProperty`  -  `get` ， 依赖收集

2. ` Object.defineProperty`  -  `set`， 依赖更新

3. 每个 `data` 声明的属性，都拥有一个的专属依赖收集器 `subs`

4. 依赖收集器 `subs` 保存的依赖是 `watcher`

5. `watcher` 可用于 进行视图更新

#### 详细过程


```js
  function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};

    /**
     * 。。。省略代码：
     * data不是Object，设置为{}, 并提出警告
     *  遍历数据, 获取属性key
     *  1. 若key与methods中key同名 提出警告
     *  2. 判断key与props中key同名 提出警告，否则将vm._data代理(使用Object.defineProperty)到vm上(即可通过vm[key]获取)
    */

    // 观察数据
    observe(data, true /* asRootData */);
  }
```

```js
   function observe (value, asRootData) {
   // ... (判断value类型：引用类型，不是VNode实例)
    var ob;
    // ... (若value存在__ob__属性，同时此属性是Observer实例，满足ob = value.__ob__),
    // 若无__ob__属性
    ob = new Observer(value);
    // ...
    return ob
  }
```

```js
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this); // 详解见下：`__ob__`属性的作用
    if (Array.isArray(value)) {
     // ...之后讨论
    } else {
      this.walk(value);
    }
  };
```

##### `Observer`中依据数据类型分情况处理

###### 数组

```js
if (hasProto) {
  // value原型指向arrayMethods
  protoAugment(value, arrayMethods);
} else {
  // arrayKeys遍历保存到value上
  copyAugment(value, arrayMethods, arrayKeys);
}
// 观察observe
this.observeArray(value);

```

###### 对象

```js
 Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive$$1(obj, keys[i]);
    }
  };

 function defineReactive$$1 ( obj, key, val, customSetter, shallow ) {
    // dep 用于收集所有 依赖
    var dep = new Dep();
    // ...
    // 若属性值为引用类型的，
    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      // ...
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        // ... 依赖收集
        return value
      },
      set: function reactiveSetter (newVal) {
        val = newVal
        // ... 依赖通知
      }
    });
  }

```

##### 执行结果

```js
 new Vue({
     data(){
         return {
          message: 'hello word',
          person: {
             name: 'luch',
             age: 21
          },
          list: ['a', 'b']
        }
     }
 })

```

经过`initData`

```js
 data = {
    message: 'hello word',
    person: {
        name: 'luch',
        age: 21,
        __ob__: Observer{
            dep: Dep{id: 5, subs: []}
            value: { ... }
        }
    },
    list: {
        'a',
        'b',
        __ob__: Observer{
            dep: Dep{id: 6, subs: []}
            value: { ... }
        }
    }
    __ob__: Observer{
        dep: Dep{id: 4, subs: []}
        value: { ... }
    }
 }

```

##### `__ob__`属性的作用

###### 对象

在`defineReactive$$1`中对不同类型的数据处理不同

`message`基础数据类型  只使用 【闭包`dep`】 来存储依赖

`person`引用数据类型   使用 【闭包`dep`】 和 【` __ob__.dep`】 两种来存储依赖

问题：

为什么引用类型需要 使用`__ob__.dep `存储依赖呢?

闭包 `dep` 只存在 `defineReactive$$1` 中，其他地方无法使用到，所以需要保存另外一个在其他地方使用

在其他什么地方会使用呢？

```js
person.love = 'chinese'

delete child.love

```

动态给对象添加和删除属性时，`Vue`监听不到对象的变化并不进行更新

为解决不更新，`Vue`原型上挂载了 set 和 del 两个方法，源码如下

```js
 function set(target, key, val) {
    var ob = (target).__ob__;
    // 通知依赖更新
    ob.dep.notify();
 }
 Vue.prototype.$set = set;

```

```js
function del(target, key) {
    var ob = (target).__ob__;
    delete target[key];
    if (!ob)  return
    // 通知依赖更新
    ob.dep.notify();
}
Vue.prototype.$delete = del;

```

###### 数组

数组中的 `__ob__.dep` 同样是用来存储依赖，那么何时使用呢？

```js
list[2] = 'cc'

```

通过索引更改数组时，不会更新视图，所以`vue`内部对数组的方法进行了劫持，重写，以便于调用这些方法时可以通知更新

```js
 var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [ 'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse' ];

  methodsToPatch.forEach(function (method) {
    // 缓存原方法
    var original = arrayProto[method];
    // 通过Object.defineProperty对以上七种方法进行重写
    def(arrayMethods, method, function mutator () {
      // ...
      // 获取 传给 push 等方法的参数
      while ( len-- ) args[ len ] = arguments[ len ];
      //执行原方法
      
      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        // ... 获取插入的数据
      }
      // 存在插入的数据，对新插入的数据进行观察
      if (inserted) { ob.observeArray(inserted); }

      // 通知变化
      ob.dep.notify();
      return result
    });
  });

```