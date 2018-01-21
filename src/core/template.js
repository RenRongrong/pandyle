var Pandyle;
(function (Pandyle) {
    var VM = (function () {
        function VM(element, data) {
            this._data = data;
            this._root = element;
            this._relations = [];
            this.init();
        }
        VM.prototype.set = function (newData) {
            var _this = this;
            var _loop_1 = function (key) {
                var properties = key.split('.');
                var lastProperty = properties.pop();
                if (properties.length == 0) {
                    this_1._data[lastProperty] = newData[key];
                }
                else {
                    var target = properties.reduce(function (obj, current) {
                        return obj[current];
                    }, this_1._data);
                    target[lastProperty] = newData[key];
                }
                var relation = this_1._relations.filter(function (value) { return value.property == key; });
                if (relation.length > 0) {
                    relation[0].elements.forEach(function (ele) {
                        _this.setBind(ele, _this._data);
                    });
                }
            };
            var this_1 = this;
            for (var key in newData) {
                _loop_1(key);
            }
        };
        VM.prototype.init = function () {
            this.setBind(this._root, this._data);
        };
        VM.prototype.setBind = function (element, data) {
            var _this = this;
            element.each(function (index, ele) {
                $(ele).data('context', data);
                if ($(ele).attr('p-each')) {
                    _this.bindFor($(ele), data);
                }
                else if ($(ele).children().length > 0) {
                    for (var i = 0; i < $(ele).children().length; i++) {
                        var child = $($(ele).children()[i]);
                        child.data('context', data);
                        _this.setBind(child, data);
                    }
                }
                else {
                    _this.bindText($(ele));
                }
            });
        };
        VM.prototype.bindFor = function (element, data) {
            if (element.attr('p-each')) {
                var property = element.attr('p-each').replace(/\s/g, '');
                var nodes = property.split('.');
                this.setRelation(property, element);
                var target = nodes.reduce(function (obj, current) {
                    return obj[current];
                }, data);
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                }
                var children = $(element.data('pattern'));
                element.children().remove();
                for (var i = 0; i < target.length; i++) {
                    var newChildren = children.clone(true, true);
                    element.append(newChildren);
                    this.setBind(newChildren, target[i]);
                }
            }
        };
        VM.prototype.bindText = function (element) {
            var _this = this;
            var data = element.data('context');
            var text = element.text();
            var reg = /{{\s*([\w\.]*)\s*}}/g;
            if (!element.data('binding')) {
                element.data('binding', []);
                if (reg.test(text)) {
                    element.data('binding').text = text;
                }
            }
            else {
                text = element.data('binding').text || text;
            }
            var result = text.replace(reg, function ($0, $1) {
                _this.setRelation($1, element);
                var nodes = $1.split('.');
                return nodes.reduce(function (obj, current) {
                    return obj[current];
                }, data);
            });
            element.text(result);
        };
        VM.prototype.setRelation = function (property, element) {
            var relation = this._relations.filter(function (value) { return value.property == property; });
            if (relation.length == 0) {
                this._relations.push({
                    property: property,
                    elements: [element]
                });
            }
            else {
                relation[0].elements.push(element);
            }
        };
        return VM;
    }());
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));
