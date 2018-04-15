var uid = 17;
Pandyle.config({
    comPath: {
        demo: '/demo/components/{name}.html'
    }
})
var honors = [];
for (var i = 0; i < 100; i++) {
    honors.push('test' + i);
}
$(document).ready(function() {
    var data = {
        id: 2,
        title: '百年孤独',
        author: {
            name: '<p>马尔克斯</p><p>加西亚</p>',
            nation: '哥伦比亚',
            honors: honors
        },
        price: 89,
        tags: [
            '名著',
            '文学',
            '外国'
        ],
        next: {
            t: '三国演义',
            a: '罗贯中',
            p: 35
        },
        list: {
            name: 'type',
            selects: [{
                    content: '类型1',
                    value: 1
                },
                {
                    content: '类型2',
                    value: 2
                }
            ]
        }
    }
    var now = Date.now();
    vm = $('.temp').vm(data, false);
    vm.register('bookConverter', function(data) {
        return {
            title: data.t,
            author: data.a,
            price: data.p
        }
    });
    vm.register('tagFilter', function(data) {
        return data.filter(function(x) {
            return x == '名著';
        })
    })
    vm.run();
    var then = Date.now();
    console.log(then - now);
})

function setName() {
    var honors2 = [];
    for (var i = 0; i < 300; i++) {
        honors2.push('测试' + i);
    }
    var now = Date.now();
    vm.set({
        next: {
            t: '水浒传',
            a: '施耐庵',
            p: 40
        },
        'author.honors': honors2,
        title: '书本'
    });
    var then = Date.now();
    console.log(then - now);
}

function add(n) {
    return n + 1;
}