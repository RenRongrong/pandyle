var Pandyle;
(function(Pandyle) {
    var VM = /** @class */ (function() {
        function VM(element, data) {
            this._data = data;
            this._root = element;
            this._relations = [];
            this.init();
        }
        VM.prototype.set = function(newData) {
            var _this = this;
            var _loop_1 = function(key) {
                var property = key.split('.').reduce(function(obj, current) {
                    return obj[current];
                }, this_1._data);
                property = newData[key];
                var relation = this_1._relations.filter(function(value) { return value.property == key; });
                if (relation.length > 0) {
                    relation[0].elements.forEach(function(ele) {
                        _this.setBind(ele, newData[key]);
                    });
                }
            };
            var this_1 = this;
            for (var key in newData) {
                _loop_1(key);
            }
        };
        VM.prototype.init = function() {
            this.setBind(this._root, this._data);
        };
        VM.prototype.setBind = function(element, data) {
            var _this = this;
            if (element.children().length > 0) {
                for (var i = 0; i < element.children().length; i++) {
                    var child = $(element.children()[i]);
                    child.data('context', data);
                    this.setBind(child, data);
                }
            } else {
                if (!element.data('pattern')) {
                    element.data('pattern', element.text());
                }
                var reg = /{{\s*([\w\.]*)\s*}}/g;
                var result = element.text().replace(reg, function($0, $1) {
                    _this.setRelation($1, element);
                    var nodes = $1.split('.');
                    return nodes.reduce(function(obj, current) {
                        return obj[current];
                    }, data);
                });
                element.text(result);
            }
        };
        VM.prototype.setRelation = function(property, element) {
            var relation = this._relations.filter(function(value) {
                value.property == property;
            });
            if (relation.length == 0) {
                this._relations.push({
                    property: property,
                    elements: [element]
                });
            } else {
                relation[0].elements.push(element);
            }
        };
        return VM;
    }());
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));