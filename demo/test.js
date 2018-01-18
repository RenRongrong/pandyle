$(document).ready(function() {
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