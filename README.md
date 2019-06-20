# pandyle

pandyle是一个基于jquery的MVVM库。它为jquery提供了基本的模板和组件功能。pandyle秉承jquery -- **write less, do more** 的设计理念，主要关注点即在于**简单**，它的大小只有7kb（压缩后），易学易用，努力减少你书写的代码量，并且更贴合传统的jquery的书写方式。

## 特点

- 简单：非常简单易上手，无需学习webpack、es6等前端知识，基本看一遍文档即可进行开发
- 兼容性良好：pandyle的兼容性取决于jquery版本，因此使用1.X版本的jquery即可兼容至ie8浏览器
- 输入与视图模型分离：pandyle使用inputs类来独立的处理用户输入，根据表单元素的name属性自动生成数据模型，无需事先定义
- 同步操作：pandyle的所有操作都是同步的，代码逻辑清晰的同时保证了同其他jQuery插件的良好兼容
- 资源化的组件：pandyle将组件视为一种资源，这意味着你可以像加载图片一样任意加载你想要的任意组件，只需在p-com指令中写上组件的路径即可，无需事先编译或引入特定的组件代码。此外，在pandyle中，你可以很轻松的使用p-bind来动态的绑定组件，使页面能够完全根据数据来动态生成，如以下示例：

    
        <div class="main">
            <div p-for="components" p-as="item">
                <div p-bind="p-com:{{@item.type}}" p-context="@item.data">
            </div>
        </div>

        <script>
            Pandyle.config({
                comPath: {
                    Default: './otherComponents/{name}.html',
                    Menu: './otherComponents/menu/{name}.html',
                    MyCom: './components/{name}.html'
                }
            })
    
            var book1 = {
                title: 'book1',
                author: 'rrr',
                price: 20,
                num: 10,
                tags: ['tag1', 'tag2', 'tag3']
            };
    
            var list = [
                {
                    value: 1,
                    name: '选项1'
                },
                {
                    value: 2,
                    name: '选项2'
                }
            ]
            var vm = $('.main').vm({
                components: [
                    {
                        type: 'test'
                    },
                    {
                        type: 'MyCom.book',
                        data: book1
                    },
                    {
                        type: 'list',
                        data: {
                            title: '列表1',
                            name: 'checkList',
                            list: list
                        }
                    }
                ]
            })
        </script>

## 适用场景

- 老项目重构：这可能是pandyle最能发挥作用的场景。很多老项目中使用了大量的jquery代码及jquery插件，使用其他框架进行重构的话可能会引起大量的修改，使用pandyle能以最小的代价对老项目完成mvvm的改造
- 兼容性要求较高的项目：一些特定领域的项目可能仍然要求兼容ie8甚至ie8以下的浏览器，不适合使用三大框架，这种情况下可以尝试使用pandyle作为替代
- 后端人员开发：pandyle对后端开发者是友好的，无需掌握现代前端的一系列工具和语法，后端开发者可以轻松上手
- 小项目：对小项目来说，pandyle的开发效率可能更高，有兴趣的可以尝试一下

## 文档

[在wiki中查看文档](https://github.com/RenRongrong/pandyle/wiki)

## 交流

你可以加入QQ群进行技术交流：524640426

