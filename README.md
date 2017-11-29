# pandyle
pandyle是一个基于flex布局的样式库，其目的是在html中进行快速布局。
## 使用方法

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