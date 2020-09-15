let vm = new MVVM({
    el: '#app',
    data(){
      return {
        message: 'hello world'
      }
    },
    watch: {
      message(val) { 
        console.log(val, '===== watch message ======')
      }
    }
  })
  
  setTimeout(() => {
    vm.message = 'hello china'
  }, 2000)