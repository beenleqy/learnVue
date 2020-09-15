#### vscode调试配置

##### 准备

安装Debugger for Chrome扩展插件

文件目录

```
 ├─ dome 
 │  ├─ .vscode
 │  │  └─ launch.json
 │  ├─ index.html
 │  │  ├─ vue.js
 │  │  └─ index.js
```

```html
// index.html
<body>
 <div id="app">{{ txt }}</div>
 <script src="./vue.js"></script>
 <script src="./index.js"></script>
</body>
```

```js
// index.js
new Vue({  
    el: '#app',
    data: {
        txt: 'Hello word'
    }
})
```

##### 配置

点击左侧小虫（下图：1）或使用快捷键 shift+ctrl+D 进入调试操作

点击齿轮（下图：2）将自动生成`launch.json`，简单修改配置如下：

```json
 "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome",
            "file": "${workspaceFolder}/index.html"
        }
 ]
```

##### 调试

代码左侧（如下图：4）打断点

点击开始（下图：3），点击工具栏（下图：5）即可进入调试

![调试界面](https://note.youdao.com/yws/api/personal/file/WEBb327573c33ce70fad7409a65e2bdaa3f?method=download&shareKey=6e1e852a489418b51afb3e138949fb78)



