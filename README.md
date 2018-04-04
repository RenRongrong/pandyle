# pandyle

pandyle是一个基于jquery的MVVM库。它为jquery提供了基本的模板和组件功能。pandyle秉承jquery -- **write less, do more** 的设计理念，主要关注点即在于**简单**，它的大小只有5kb（压缩后），易学易用，努力减少你书写的代码量，并且更贴合传统的jquery的书写方式。

## 为什么要写这个库

现在已经有angular、react、vue等优秀的MVVM框架了，但是**我爱jquery**！所以就想试着为jquery写一个mvvm库来实现数据与视图的分离以及组件化开发的能力。如果你也喜欢jquery，可以来尝试一下这个库。欢迎你的issue和PR！

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

### **VM类**

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

            var data = {
                message: 'hello world',
                list: [{
                    name: '张三'
                }, {
                    name: '李四'
                }]
            };
            var vm = $('.main').vm(data);
            vm.set({
                message: 'goodbye',
                'list[1].name': '王五'  //使用扁平化方式更新数据，数组和属性的书写方式跟js中一样，这种情况下字段名需加上引号。
            });

* get方法：

    get方法返回VM数据的副本，具体用法如下：

            var data = {
                message: 'hello world',
                list: [{
                    name: '张三'
                }, {
                    name: '李四'
                }]
            };
            var vm = $('.main').vm(data);
            var msg = vm.get('message');  //--'hello world'
            var array = vm.get(['message', 'list[0].name']);  //--['hello world', '张三']  传入数组时，将数组中每个元素所对应的数据映射到一个新数组并返回。
            var obj = vm.get({
                msg: 'message',
                name: 'list[0].name'
            });  //--{msg: 'hello world', name: '张三'}  传入json对象时，将对象中每个属性所对应的数据映射到一个新对象并返回。
            var data2 = vm.get(); //参数为空时，返回vm中data的副本。注意data2 !== data


### **模板语法**

* 使用两对花括号{{}}进行文本插值绑定

        <div>显示message属性：{{message}}</div>
        <script>
            $('div').vm({message: 'hello world'});
        </script>
    
    在花括号中可以调用函数：

        <div>显示处理过的message属性：{{foo(message)}}</div>
        <script>
            $('div').vm({message: 'hello world'});
            function foo(s){
                return s + ' ha ha!';
            }
        </script>
* 使用p-bind进行属性绑定

    使用p-bind对元素的属性进行绑定，多个属性之间使用^分隔。属性名称与属性值之间使用英文冒号:分隔，属性值里面使用{{}}进行文本插值绑定。

        <img p-bind="class:round {{myClass}} ^ src:{{mySrc}}">
        <!-- 渲染后是<img class="round border" src="avatar.jpg"> -->
        <style>
            .round{
                border-radius:50%;
                width:100px;
                height:100px;
            }
            .border{
                border:2px solid red;
            }
        </style>
        <script>
            $('img').vm({
                myClass: 'border',
                mySrc: 'avatar.jpg'
            })
        </script>
* 使用p-each进行循环操作

    对一个元素使用p-each绑定一个数组，它的子元素会根据数组的内容进行循环。循环是在p-each元素的内部进行的，p-each元素本身不会改变

        <div p-each="list">
            <p>{{name}}</p>
        </div>
        <!-- 渲染后是
        <div p-each="list">
            <p>张三</p>
            <p>李四</p>
        </div>
        -->
        <script>
            var data = {
                list: [
                    {name: '张三'},
                    {name: '李四'}
                ]
            };
            $('div').vm(data);
        </script>

    在p-each下，可以使用@self指代循环的对象本身，使用@index指代当前对象的索引值。

        <div p-each="list">
            <p>{{@index}}: {{@self}}</p>
        </div>
        <!-- 渲染后是
        <div p-each="list">
            <p>0: 张三</p>
            <p>1: 李四</p>
        </div>
        -->
        <script>
            var data = {
                list: [
                    '张三',
                    '李四'
                ]
            };
            $('div').vm(data);
        </script>

* 使用p-if进行条件判断

    使用p-if绑定一个布尔值，当这个布尔值为真时，p-if所在的元素将显示出来，否则将隐藏。

        <div p-if="{{show}}">hello world</div>
        <button onclick="toggle()">切换</button>

        <script>
            var vm = $('div').vm({show: true});
            function toggle(){
                var isShow = vm.get('show');
                vm.set({
                    show: !isShow
                })
            }
        </script>

* 使用p-context设置上下文

    在pandyle中，可以使用p-context为元素设置数据上下文。该元素及其子元素的数据绑定将按照上下文进行解析。

        <div p-context="info">
            <p>{{name}}</p>
            <p>{{age}}</p>
        </div>

        <script>
            $('div').vm({
                message: 'hello world',
                info: {
                    name: '张三',
                    age: 29
                }
            })
        </script>

    在p-context中，可以使用转换器对数据上下文进行转换。转换器使用管道语法data | converter书写，converter是一个转换器函数，该函数接收一个输入参数，并返回一个对象。在使用管道之前，需要先将converter注册到vm的转换器集合中。

        <div p-context="info | test">
            <p>{{name}}</p>
            <p>{{age}}</p>
        </div>

        <script>
            var vm = $('div').vm({
                message: 'hello world',
                info: {
                    name: '张三',
                    age: 29
                }
            }, false);  //在vm函数中将autoRun设置为false，以阻止渲染。
            vm.register('testConverter', function(data){  //注册转换器testConverter（转换器的命名必须以Converter结尾）
                data.name = '李四';
                data.age++;
                return data;
            })
            vm.run();  //调用vm.run()进行渲染
        </script>

    还可以使用直接对象转换的方式对上下文进行转换。格式为data | {...}。

        <div class="main">
            <div p-context="info | {myName: name, myAge: age, msg: 'hello'}">
                <p>{{myName}}</p>
                <p>{{myAge}}</p>
                <p>{{msg}}</p>
            </div>
            <div p-context="|{myName: '李四', myAge: 30}">
                <p>{{myName}}</p>
                <p>{{myAge}}</p>
            </div>
        </div>

        <script>
            $('.main').vm({
                info: {
                    name: '张三',
                    age: 29
                }
            });
        </script>
    
## Inputs类

pandyle使用Inputs类来管理用户的输入。

* 创建：使用$(...).inputs()来创建Inputs类的实例，该实例获取指定元素下面所有表单元素的输入数据（表单元素不需要包含在`<form>`元素内）。也可使用`new Pandyle.Inputs(element)`来创建实例。

* Inputs拥有以下两个方法：

1. data()：将表单元素的数据映射为对象并返回。
2. set(data): 设置指定字段的值并更新对应的表单元素。

        <div>
            <p>
                姓名： <input type="text" name="name">
            </p>
            <p>
                性别： 
                <label>
                    男
                    <input type="radio" name="sex" value="1">
                </label>
                <label>
                    女
                    <input type="radio" name="sex" value="2">
                </label>
            </p>
            <p>
                职位：
                <select name="marriage">
                    <option value="0">请选择</option>
                    <option value="1">码农</option>
                    <option value="2">设计</option>
                    <option value="3">PM</option>
                </select>
            </p>
            <button onclick="output()">输出</button>
            <button onclick="reset()">重置</button>
        </div>

        <script>
            var inputs = $('div').inputs();

            function output(){
                console.log(inputs.data());
                
            }

            function reset(){
                inputs.set({
                    name: '',
                    sex: '',
                    job: 0
                })
            }
        </script>

## 组件

pandyle使用c标签提供组件功能。pandyle中的组件实质就是一段html代码，c标签中使用p-com属性来指定组件的名称。VM会根据p-com中指定的名称和Pandyle配置中的comPath字段去加载对应的组件并渲染。如果没有设置comPath，VM会在默认的`/components`文件夹中寻找对应名称的组件。

*示例代码：/index.html中：*

        <div class="main">
            <c p-com="demo.book" p-context="|{title: '三国演义', author: '罗贯中', price: 150}">
        </div>

        <script>
            //使用Pandyle.config来设置comPath
            Pandyle.config({
                comPath:{
                    demo: '/demo/components/{name}.html'
                }               
            });
            $('.main').vm();
        </script>

*示例代码：/demo/components/book.html文件夹中*:

        <div>
            <p>书名：{{title}}</p>
            <p>作者：{{author}}</p>
            <p>价格：{{price}}</p>
        </div>