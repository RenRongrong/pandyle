$(document).ready(function() {
    var arr = [
        { property: "content.id", element: 1 },
        { property: "content.name.str", element: 2 },
        { property: "type", element: 3 }
    ];
    var a1 = arr.filter(function(value) {
        value.property === 'content.id';
    })
    console.log(a1);
    vm = new Pandyle.VM($('#temp'), {
        content: {
            id: 2,
            name: {
                str: 'rrr'
            }
        },
        type: 'test'
    });
})

function test() {
    vm.set({
        "content.id": 3,
        "content.name.str": 'xxx',
        "type": 't2'
    });
}