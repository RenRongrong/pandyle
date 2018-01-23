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
                name: 'aaa'
            },
            {
                id: 102,
                name: 'bbb'
            },
            {
                id: 103,
                name: 'ccc'
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
        "list": [{
                id: 201,
                name: 'xxx'
            },
            {
                id: 202,
                name: 'yyy'
            }
        ],
        "link": "http://www.qq.com",
        "class": "foo"
    });
}