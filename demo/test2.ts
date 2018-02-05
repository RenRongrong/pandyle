import { Pandyle } from '../src/core/template';
$(document).ready(function () {
    let vm = new Pandyle.VM($('.temp',), {
        content: {
            id: 2,
            name: {
                str: 'rrr'
            }
        },
        type: 'test',
        show: true,
        correct: true,
        list: [{
            id: 101,
            name: 'aaa',
            hobbies: [{
                hobby: '游泳',
                type: '体育'
            },
            {
                hobby: '看书',
                type: '文艺'
            }
            ]
        },
        {
            id: 102,
            name: 'bbb',
            hobbies: [{
                hobby: '唱歌',
                type: '文艺'
            },
            {
                hobby: '游戏',
                type: '娱乐'
            }
            ]
        },
        {
            id: 103,
            name: 'ccc',
            hobbies: [{
                hobby: '唱歌',
                type: '文艺'
            },
            {
                hobby: '游戏',
                type: '娱乐'
            }
            ]
        }
        ],
        link: 'http://www.baidu.com',
        class: 'link',
        add: function (num) {
            return 3 + num;
        }
    }, false);
    vm.register('hello',  function(message) {
        var name = this.get('content.name.str');
        return 'hello ' + message + name;
    });
    vm.run();
})

function goodbye(message, x) {
    return 'goodbye ' + message + (x + 1);
}