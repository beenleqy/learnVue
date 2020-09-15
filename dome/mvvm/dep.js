var uid = 0;
var Dep = function Dep () {
  this.id = uid++;
  this.subs = []; 
};

Dep.prototype.addSub = function addSub (sub) {
  // sub ==> watcher实例
  this.subs.push(sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function(){
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update(); // 相当于 watcher.update
  }
}

// 全局唯一的Dep.target 以确保同一时间只有一个观察者在订阅
Dep.target = null;
var targetStack = [];

function pushTarget (target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget () {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}