$(document).ready(function() {
    vm = new Pandyle.VM($('.temp'), {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚'
        },
        price: 89
    });
})

function setName() {
    var author = vm.get('author');
    author.name = 'rrr';
    console.log(vm.get('author'));
    vm.set({ 'author': author });
    console.log(vm.get('author'));
}