function MVVM(options) {
  this._init(options)
}

MVVM.prototype._init = function (options) {
  let vm = this
  vm.$options = options;
  initData(vm)
  
  if(options.computed){ initComputed(vm, options.computed) }
  if(options.watch){ initWatch (vm, options.watch) }
  
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
}

MVVM.prototype.$mount = function(el){
  let vm = this
  el = vm.$el = document.querySelector(el) //获取dom元素
  let updateComponent = () => {
      vm._update() //更新
  }

  //监听 render Watcher
  new Watcher(vm, updateComponent )
}

MVVM.prototype._update = function(){
  // let vm = this;
  // console.log('读取sum的值：' + vm.sum)
  let vm = this;
  let el = vm.$el;

  //创建文档碎片
  let node = document.createDocumentFragment();
  let firstChild;
  while (firstChild = el.firstChild) {
      node.appendChild(firstChild)
  }
  //编译
  compiler(node, vm)
  el.appendChild(node)
}