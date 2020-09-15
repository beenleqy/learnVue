function initData(vm){
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? data.call(vm, vm) : data || {};
  for(let key in data){
    proxy(vm, "_data", key);
  }
  observe(data);
}

function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get: function proxyGetter () {
      return target[sourceKey][key]
    },
    set: function proxySetter (val) {
      target[sourceKey][key] = val;
    }
  });
}