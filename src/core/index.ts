(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof module === 'object') {
        exports = module.exports = factory(require('jquery'));
    } else {
        factory(root.jQuery);
    }
})(this, function ($: any) {
    Pandyle.$ = $;
    $.fn.vm = function (data, autoRun = true) {
        let element: JQuery<HTMLElement> = this;
        if (element.data('vm')) {
            return element.data('vm');
        } else {
            let vm = new Pandyle.VM(element, data, autoRun);
            element.data('vm', vm);
            return vm;
        }
    }

    $.fn.inputs = function () {
        let element: JQuery<HTMLElement> = this;
        if (element.data('inputs')) {
            return element.data('inputs');
        } else {
            let inputs = new Pandyle.Inputs(element);
            element.data('inputs', inputs);
            return inputs;
        }
    }

    return Pandyle;
})