var x = 0;

$(document).ready(function() {
    vm = new Pandyle.VM($('.temp'), {
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
        add: function(num) {
            return 3 + num;
        }
    });
})

function test() {
    vm.set({
        "show": true,
        "content.id": 3,
        "content.name.str": 'xxx',
        "type": 't2',
        "link": "http://www.qq.com",
        "class": "foo",
        "list": [{
                id: 201,
                name: 'xxx',
                hobbies: [{
                        hobby: '篮球',
                        type: '体育'
                    },
                    {
                        hobby: '音乐',
                        type: '文艺'
                    }
                ]
            },
            {
                id: 202,
                name: 'yyy',
                hobbies: [{
                        hobby: '足球',
                        type: '体育'
                    },
                    {
                        hobby: '电影',
                        type: '娱乐'
                    }
                ]
            },
        ]
    });
}

function test2() {
    vm.set({
        show: true
    })
}

function test3() {
    var value = vm.get({
        myType: 'type',
        myList: 'list',
        myId: 'content.id',
        myHobby: 'list[0].hobbies',
        addResult: 'add(2)'
    });
    console.log(value);
}