var __extends = (this && this.__extends) || (function() {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] }
            instanceof Array && function(d, b) { d.__proto__ = b; }) ||
        function(d, b) {
            for (var p in b)
                if (b.hasOwnProperty(p)) d[p] = b[p];
        };
    return function(d, b) {
        extendStatics(d, b);

        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var x = 2;
var vm;
$(document).ready(function() {
    vm = new myVM($('.temp'), {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚'
        },
        price: 89
    });
});

function setName() {
    var author = vm.author;
    author.name = 'rrr';
    vm.author.name = 'xxx';
    console.log(vm.author);
    vm.author = author;
    console.log(vm.author);
}

function goodbye(message, x) {
    return 'goodbye ' + message + (x + 1);
}
var myVM = /** @class */ (function(_super) {
    __extends(myVM, _super);

    function myVM() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(myVM.prototype, "title", {
        get: function() {
            return this.get('title');
        },
        set: function(value) {
            this.set({
                'title': value
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(myVM.prototype, "author", {
        get: function() {
            return this.get('author');
        },
        set: function(value) {
            this.set({
                'author': value
            });
        },
        enumerable: true,
        configurable: true
    });
    return myVM;
}(Pandyle.VM));