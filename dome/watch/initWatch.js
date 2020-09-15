function initWatch (vm, watch) {
  for (var key in watch) {
    var handler = watch[key];
    createWatcher(vm, key, handler);
  }
}

function createWatcher (vm, expOrFn, handler, options) {
  return vm.$watch(expOrFn, handler, options)
}
