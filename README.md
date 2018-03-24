# pandyle
**write less, do more**

pandyle是一个基于jquery的MVVM框架。它提供了模板和组件的功能。pandyle遵循jquery的宗旨，主要关注点在于两字——**简单**，它的大小只有4.8kb（压缩后），易学易用，将尽可能减少你书写的代码量，并且更符合传统的网页构建方式。

## 使用方法

下载：npm install pandyle

引入：使用\<script\>标签引用pandyle.min.js即可。

### **Hello Wrold**
    
*代码示例：hello world*
    
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Hello Pandyle</title>
        <script src="../node_modules/jquery/dist/jquery.min.js"></script>
        <script src="../dist/pandyle.min.js"></script>
    </head>

    <body>
        <div class="main">{{message}}</div>
        <script>
            var data = {message: 'hello world'};
            $('.main').vm(data);
        </script>
    </body>

    </html>

### **关于VM**

pandyle由VM管理数据和模板之间的数据绑定。

* 创建：
    1. 使用$('...').vm(data, autoRun)创建一个VM对象，并将这个VM对象跟jquery选择器中的元素关联起来。参数data接收一个json对象，此对象将与模板进行绑定。参数autoRun指示在创建好VM对象之后是否立即渲染模板，默认为true。此函数返回选择器中元素所关联的VM对象。
        
            var vm = $('.main').vm(data);  //创建VM对象并赋值给vm变量。

            var vm2 = $('.main').vm(); //不传参数时，返回此元素关联的VM对象。vm2 === vm。
    2. 也可使用new Pandyle.VM(element, data, autoRun)来创建VM对象。参数element是一个Jquery对象，data和autoRun含义同上（第一个方法实际是封装了此构造函数）
            
            var vm = new Pandyle.VM($('.class'), data);

* set方法：
    
    VM只能使用set方法来更新数据，它接收一个扁平化的json对象。更新数据之后将立即更新对应的dom元素。

            vm.set({message: 'goodbye!'});
    如果data数据存在多个层级，需使用扁平化的方式传给set函数。


### **模板语法**

* 使用两对花括号{{}}进行文本值绑定
* 使用p-bind进行属性绑定
* 使用p-each进行循环操作
* 使用p-if进行条件判断

*代码示例：模板语法*

    <div class="main">
        <p>user ID: {{id}}</p>
        <p>user Name: {{name}}</p>
        <p p-if="show">show it!</p>
        <p>user Hobbies:</p>
        <div p-each="hobbies">
            <div>
                <p>{{hobby_name}}</p>
                <p p-bind="class:{{hobby_type}}">{{hobby_type}</p>
            </div>
        </div>
    </div>


