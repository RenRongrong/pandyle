var uid = 17;
Pandyle.config({
    comPath: {
        default: '/components/{name}.html',
        demo: '/demo/components/{name}.html'
    }
})
$(document).ready(function() {
    var data = {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚',
            honors: ['作家', '文学家']
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
})

function setName() {
    vm.set({
        next: {
            t: '水浒传',
            a: '施耐庵',
            p: 40
        }
    });
    foo();
    foo2();
}

function add(n) {
    return n + 1;
}