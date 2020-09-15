// 数组方法改写，便于用户调用时vm进行监听数据
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);

var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse',
];

methodsToPatch.forEach(function (method) {
    // 缓存原方法
    var original = arrayProto[method];
    Object.defineProperty(arrayMethods, method, {
        value: function mutator() {
            var args = [], len = arguments.length;
    
            // 获取参数
            while (len--) args[len] = arguments[len];
            // 调用原方法
            var result = original.apply(this, args);
            var ob = this.__ob__;
            var inserted;
            // 获取插入的 新数据 ，便于观察
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break
                case 'splice':
                    inserted = args.slice(2);
                    break
            }
            if (inserted) { ob.observeArray(inserted); }
            // 通知更新
            ob.dep.notify();
            return result
        },
        // enumerable: !!enumerable,
        writable: true,
        configurable: true
      });
});

function protoAugment(target, src) {
    /* 设置数组的原型上的方法 */
    target.__proto__ = src;
}

var Observer = function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    /**
     * 引用类型的__ob__属性: 包含 dep ; 存储依赖
     * 对象使用 __ob__.dep，作用在  Vue 自定义的方法 set 和 del 中
     * 数组使用 __ob__.dep，作用在 Vue 重写的数组方法 push 等中
     */
    Object.defineProperty(value, '__ob__', {
        value: this,
        // enumerable: !!enumerable,
        writable: true,
        configurable: true
    });

    if (Array.isArray(value)) {
        protoAugment(value, arrayMethods);
        this.observeArray(value);
    } else {
        this.walk(value);
    }
};

Observer.prototype.walk = function walk(obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        defineReactive$$1(obj, keys[i]);
    }
};

Observer.prototype.observeArray = function observeArray(items) {
    for (var i = 0, l = items.length; i < l; i++) {
        observe(items[i]);
    }
};

function observe(value) {
    if( typeof value != 'object' || value == null){
        return
    }
    if (value.__ob__){
        return value.__ob__
    }
    return new Observer(value);
}

function defineReactive$$1(obj, key) {
    var dep = new Dep();
    var value = obj[key];
    var childOb = observe(value);
    
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                }
            }
            return value
        },
        set: function reactiveSetter(newVal) {
            if (newVal === value) return
            value = newVal;
            observe(newVal);
            dep.notify();
        }
    });
}

function dependArray(value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
        e = value[i];
        e && e.__ob__ && e.__ob__.dep.depend();
        if (Array.isArray(e)) {
            dependArray(e);
        }
    }
}