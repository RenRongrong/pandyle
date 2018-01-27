# pandyle
pandyle是一个基于jquery的MVVM框架。正在开发中。。。

文档也将随着开发进度更新。。。

整体组成分为核心（core)、组件（components）、工具（utils）、布局（layout）。其中核心部分解决mvvm中的数据绑定问题，组件部分提供一些常用的组建（如轮播图等），工具部分主要封装一些日常工作中常用的操作，布局部分提供一个基于flex的布局样式库。工具和布局都是独立于框架之外的，可以根据需要使用。
## 使用方法

npm install pandyle

### **开始**
    
*代码示例：创建vm*
    
    var data = {
        id: 1,
        name: 'test',
        hobbies: [
            {
                hobby_name: 'swim',
                hobby_type: 'sport'
            },
            {
                hobby_name: 'reading',
                hobby_type: 'study'
            }
        ]
    }
    var vm = new Pandyle($('.#main'), data);


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


### **布局**
在需要布局的容器中加入class="flex"即可。通过x-和y-系列class可以改变对齐方式，通过data-gap属性可以设定每个子元素之间的间隔。

* x-left: 左对齐
* x-center: 水平居中
* x-right: 右对齐
* y-top: 垂直靠上
* y-center: 垂直居中
* y-bottom: 垂直考下
* no-flex: 禁止伸缩
* no-grow: 禁止放大
* no-shrink: 禁止缩小
 
1. **横向布局**

    > pandyle默认的就是横向布局，当一个容器的class中加入了flex后，它的直接子元素就会在水平方向上排列，默认是水平方向两端对齐、垂直方向靠上对齐。

    *代码示例：默认的布局*
        
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="ie=edge">
            <title>Document</title>
            <link rel="stylesheet" href="http://www.muyao.site/pandyle/pandyle.min.css">
            <script src="http://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.8.0.js"></script>
            <script src="http://www.muyao.site/pandyle/pandyle.min.js"></script>
        </head>
        <body>
            <div class='flex' style="height: 200px; border: 1px solid silver; padding: 10px">
                <div style="width: 50px; height: 100px; background-color: silver;"></div>
                <div style="width: 100px; height: 50px; background-color: silver;"></div>
                <div style="width: 40px; height: 100px; background-color: silver;"></div>
            </div>

        </body>
        </html>
    *页面显示*
    
    ![](http://www.muyao.site/pandyle/images/flex-default.png)

    ---
    *代码示例：左对齐*

        ...
            <div class='flex x-left' data-gap="10" style="height: 200px; border: 1px solid silver; padding: 10px">
                <div style="width: 50px; height: 100px; background-color: silver;"></div>
                <div style="width: 100px; height: 50px; background-color: silver;"></div>
                <div style="width: 40px; height: 100px; background-color: silver;"></div>
            </div>
        ...
    
    *页面显示*

    ![](http://www.muyao.site/pandyle/images/flex-left.png)

    ---
    *代码示例：水平居中、垂直居中*

        ...
            <div class='flex x-center y-center' data-gap="10" style="height: 200px; border: 1px solid silver; padding: 10px">
                <div style="width: 50px; height: 100px; background-color: silver;"></div>
                <div style="width: 100px; height: 50px; background-color: silver;"></div>
                <div style="width: 40px; height: 100px; background-color: silver;"></div>
            </div>
        ...    

    *页面显示*

    ![](http://www.muyao.site/pandyle/images/flex-center.png)    

    > 在没有x-系列的class时，使用data-gap会让子元素自动按比例调整宽度，使每个子元素之间的间隔等于daga-gap的值，并且所有的子元素正好在水平方向上铺满。对某个子元素使用no-系列class可以禁止放大或缩小，其他子元素仍然按比例伸缩。

    *代码示例：自动调整*

        ...
            <div class='flex' data-gap="10" style="height: 200px; border: 1px solid silver; padding: 10px">
                <div style="width: 50px; height: 100px; background-color: silver;"></div>
                <div style="width: 100px; height: 50px; background-color: silver;"></div>
                <div style="width: 40px; height: 100px; background-color: silver;"></div>
            </div>
        ... 
    
    *页面显示*

    ![](http://www.muyao.site/pandyle/images/flex-grow.png)

    ---
    *代码示例：禁止伸缩*

        ...
            <div class='flex' data-gap="10" style="height: 200px; border: 1px solid silver; padding: 10px">
                <div class="no-flex" style="width: 50px; height: 100px; background-color: silver;"></div>
                <div style="width: 100px; height: 50px; background-color: silver;"></div>
                <div style="width: 40px; height: 100px; background-color: silver;"></div>
            </div>
        ...
    
    *页面显示*

    ![](http://www.muyao.site/pandyle/images/flex-no-flex.png)

2. **纵向布局**

    > 在class中加入'flex vertical'就可以使用纵向布局。x-系列、y-系列和no-系列的规则跟横向布局一样。

### **相对宽度**

使用w-系列的class可以很方便的为元素设定相对于父元素的宽度。w-1为父元素宽度的100%，其他比例使用w-分子-分母的形式表示，比如w-1-2表示父元素的1/2，w-5-6表示父元素的5/6。目前的最大分母为6。注意，比例关系请使用最简分数表示，比如4/6应写成w-2-3。

*代码示例：相对宽度*

    ...
    <div>
        <div class="w-1-2"></div>
        <div class="w-1-4"></div>
        <div class="w-1-4"></div>
    </div>
    ...

### **轮播图**
给一个div加入class="carousel"即可创建一个轮播图，它的每一个直接子元素（class="layer"的除外）都是轮播图的一个项目。你可以给其中一个直接子元素设置class="active"来指定它作为初始显示的项目。如果没有设置，则默认第一个直接子元素为初始项目。注意：你应该给轮播图设置一个宽高，否则它的默认宽度是100%，默认高度是100px。

*代码示例：轮播图*

    ...
    <div class="carousel">
        <img src="avatar.jpg">
        <img src="avatar.jpg">
        <img src="avatar.jpg">
    </div>
    ...

> 在轮播图的class中加入hasIndicator可以为轮播图添加指示物，默认的是白色边框的小圆圈，当前项目对应的小圆圈是红色的。你可以在css中对.indicator>*设置样式来创建个性化的指示物。

*代码示例：带指示物的轮播图*

    ...
    <div class="carousel hasIndicator">
        <img src="avatar.jpg">
        <img src="avatar.jpg">
        <img src="avatar.jpg">
    </div>
    ...

> 轮播图默认是用触摸控制的。你也可以在js中对其进行控制。使用Jquery对象`$('...').carousel()`可以获取该元素的轮播图对象，然后使用slidePrev()、slideNext()函数控制轮播图的前进或后退。使用afterSlide()可以为滑动结束后注册事件。可以注册多个事件，轮播图的每一次滑动结束之后将依次调用注册的事件。

*代码示例*

    ...
    <div class="carousel hasIndicator">
        <img src="avatar.jpg">
        <img src="avatar.jpg">
        <img src="avatar.jpg">
    </div>
    <button id="prev">前一个</button>
    <button id="next">后一个</button>
    ...

    <script>
        var c = $('.carousel').carousel();
        c.afterSlide(function(){
            alert('滑动结束！');
        })
        $('#prev').click(function(){
            c.slidePrev();
        });
        $('#next').click(function(){
            c.slideNext()
        });
    </script>
    ...

### **标签导航**
使用tab-系列的class可以创建简单的标签导航。tab-click表示鼠标点击的时候切换内容，tab-hover表示鼠标悬停时切换。你需要将所有的导航标签放到同一个div里，然后再把导航标签所对应的内容放在另一个div里。给导航标签加上`class="tab-click"`，并使用`data-target`来指定对应的内容的id。当切换到指定内容时，对应的导航标签会加上active的class，并移除其他标签的active类，因此你可以在css中对导航标签的不同状态设置样式。

*代码示例*

    ...
    <div class="flex">
        <button class="tab-hover" data-target="tab1">tab1</button>
        <button class="tab-hover" data-target="tab2">tab2</button>
    </div>
    <div>
        <div id="tab1">这是tab1</div>
        <div id="tab2" class="hidden">这是tab2</div>
    </div>
    ...
