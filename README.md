# pandyle
pandyle是一个基于flex布局的样式库，其目的是在html中进行快速布局。
## 使用方法

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
给一个div加入class="carousel"即可创建一个轮播图，它的每一个直接子元素（class="layer"的除外）都是轮播图的一个项目。你可以给其中一个直接子元素设置class="active"来指定它作为初始显示的项目。如果没有设置，则默认第一个直接子元素为初始项目。

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