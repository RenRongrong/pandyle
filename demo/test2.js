var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var vm;
$(document).ready(function () {
    vm = new myVM($('.temp'), {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚'
        },
        price: 89,
        tags: [
            '名著',
            '文学',
            '外国'
        ]
    });
});
function setName() {
    vm.author = 'rrr';
}
var myVM = (function (_super) {
    __extends(myVM, _super);
    function myVM() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(myVM.prototype, "title", {
        get: function () {
            return this.get('title');
        },
        set: function (value) {
            this.set({
                'title': value
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(myVM.prototype, "author", {
        get: function () {
            return this.get('author.name');
        },
        set: function (value) {
            this.set({
                'author.name': value
            });
        },
        enumerable: true,
        configurable: true
    });
    return myVM;
}(Pandyle.VM));
