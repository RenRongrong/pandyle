# pandyle
pandyle是一个基于flex布局的样式库，其目的是在html中进行快速布局。
## 使用方法

在需要布局的容器中加入class="flex"即可。
1. **横向布局**

    pandyle默认的就是横向布局，当一个容器的class中加入了flex后，它的直接子元素就会在水平方向上排列，默认是水平方向两端对齐、垂直方向靠上对齐；加入x-和y-系列class可以改变对齐方式，加入data-gap可以设定每个子元素之间的间隔。
    
    *代码示例：*
        
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