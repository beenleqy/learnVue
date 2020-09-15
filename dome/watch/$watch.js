MVVM.prototype.$watch = function ( expOrFn, cb, options ) {
    var vm = this;
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    return function unwatchFn () {
      watcher.teardown();
    }
};