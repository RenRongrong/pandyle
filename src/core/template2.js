var Pandyle;
(function (Pandyle) {
    var VM = (function () {
        function VM(element, data) {
            this._data = data;
            this._root = element;
            this.init();
        }
        VM.prototype.init = function () {
            this.setBind(this._root, this._data);
        };
        VM.prototype.setBind = function (element, data) {
            if (element.children().length > 0) {
                for (var i = 0; i < element.children().length; i++) {
                    var child = $(element.children()[i]);
                    child.data('context', data);
                    this.setBind(child, data);
                }
            }
            else {
                var reg = /{{\s*(\w+\.?)+\s*}}/g;
                var result = element.text().replace(reg, function ($0, $1) {
                    return data[$1];
                });
                element.text(result);
            }
        };
        return VM;
    }());
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));
