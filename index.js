// 1、computed 也是响应式的
// 2、computed 如何控制缓存
// 3、依赖的 data 改变了，computed 如何更新
var componentA = {
    props:{                
        prop1: ""
    },            

    template: '<div>父组件传入的 props 的值 {{prop1}}</div>'
}

let vm = new Vue({
    el: '#app',
    components: { componentA },
    data(){
        return {
            message: 'hello componentA',
        }
    },
})