$(document).ready(function() {
    vm = new Pandyle.VM($('.temp'), {
        content: {
            id: 2,
            name: {
                str: 'rrr'
            }
        },
        type: 'test',
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
        class: 'link'
    });
})

function test() {
    vm.set({
        "content.id": 3,
        "content.name.str": 'xxx',
        "type": 't2',
        "link": "http://www.qq.com",
        "class": "foo"
    });
}