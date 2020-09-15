var uid$2 = 0;
function Watcher( vm, expOrFn, cb, options ){
  this.id = ++uid$2; 
  this.vm = vm; 
  this.cb = cb;
  if (options) {
    this.lazy = !!options.lazy;
  } else {
    this.lazy = false;
  }
  this.dirty = this.lazy; // for lazy watchers
  // this.getter = expOrFn;

  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);
  }

  this.deps = [];
  this.newDeps = [];
  this.depIds = new Set();
  this.newDepIds = new Set();
  this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id;
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);
    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};

Watcher.prototype.cleanupDeps = function cleanupDeps () {
  var i = this.deps.length;
  while (i--) {
    var dep = this.deps[i];
    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }
  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};

Watcher.prototype.get = function get () {
  // Dep.target = this;
  pushTarget(this);
  var vm = this.vm;
  var value = this.getter.call(vm, vm);
  popTarget();
  this.cleanupDeps();
  return value
};

Watcher.prototype.depend = function depend () {
  var i = this.deps.length;
  while (i--) {
    this.deps[i].depend();
  }
};

// 计算 computed 中的值
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get();
  this.dirty = false;
};

Watcher.prototype.run = function (){
  var val = this.get();
  
  if (val !== this.value) {
    var oldValue = this.value
    this.value = val;
    this.cb.call(this.vm, val, oldValue);
  }
}

Watcher.prototype.update = function update () {
  if (this.lazy) {
    // 重置computed Watcher中的属性，便于读取时重新计算
    this.dirty = true;
  }else {
    queueWatcher(this);
  }
};

function queueWatcher(watcher){
  watcher.run();
}