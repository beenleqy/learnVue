let vm = new MVVM({
    el: '#app',
    data(){
      return {
        inputVal: 123,
        num1: 12,
        num2: 34,
        num3: 'num3=====',
      }
    },
    computed: {
      sum() { 
        return this.num1 + this.num2
      }
    }
  })
  
  setTimeout(() => {
    vm.num1 = 100
  }, 2000)