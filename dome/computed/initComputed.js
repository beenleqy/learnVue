function initComputed(vm, computed) {
  var watchers = vm._computedWatchers = Object.create(null)
  for (var key in computed) {
    var userDef = computed[key]
    var getter = typeof userDef === 'function' ? userDef : userDef.get;
    if (!getter) return
    // computed Watcher
    watchers[key] = new Watcher(vm, getter || (()=>{}), (()=>{}), { lazy: true })
    if (!(key in vm)) {
      // 将computed上的属性通过Object.defineProperty代理到vm上
      defineComputed(vm, key);
    }
  }
}

function defineComputed(target, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: createComputedGetter(key),
    set: (()=>{})
  });
}

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
