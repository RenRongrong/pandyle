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
                var target = this_1._data;
                if (properties.length > 0) {
                    target = properties.reduce(function (obj, current) {
                        return obj[current];
                    }, this_1._data);
                }
                target[lastProperty] = newData[key];
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
                if (!$(ele).data('context')) {
                    $(ele).data('context', data);
                }
                if (!$(ele).data('binding')) {
                    $(ele).data('binding', {});
                }
                _this.bindAttr(ele);
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
        VM.prototype.bindAttr = function (ele) {
            var related = true;
            if ($(ele).attr('p-bind')) {
                var binds = $(ele).attr('p-bind').split('^');
                binds.forEach(function (bindInfo, index) {
                    var array = bindInfo.split(':');
                    var attr = array[0].replace(/\s/g, '');
                    var value = array[1];
                    $(ele).data('binding')[attr] = {
                        pattern: value,
                        related: false
                    };
                });
                $(ele).removeAttr('p-bind');
                related = false;
            }
            var bindings = $(ele).data('binding');
            var data = $(ele).data('context');
            for (var a in bindings) {
                if (a != 'text') {
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a].pattern, data));
                }
            }
        };
        VM.prototype.bindFor = function (element, data) {
            if (element.attr('p-each')) {
                var property = element.attr('p-each').replace(/\s/g, '');
                var nodes = property.split('.');
                var target = nodes.reduce(function (obj, current) {
                    return obj[current];
                }, data);
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this.setRelation(property, element);
                }
                var htmlText = element.data('pattern');
                var children = $('<div />').html(htmlText).children();
                element.children().remove();
                for (var i = 0; i < target.length; i++) {
                    var newChildren = children.clone(true, true);
                    element.append(newChildren);
                    this.setBind(newChildren, target[i]);
                }
            }
        };
        VM.prototype.bindText = function (element) {
            var data = element.data('context');
            var text = element.text();
            if (element.data('binding').text) {
                text = element.data('binding').text.pattern;
            }
            var result = this.convertFromPattern(element, 'text', text, data);
            element.text(result);
        };
        VM.prototype.convertFromPattern = function (element, prop, pattern, data) {
            var _this = this;
            var reg = /{{\s*([\w\.]*)\s*}}/g;
            var related = false;
            if (reg.test(pattern)) {
                if (!element.data('binding')[prop]) {
                    element.data('binding')[prop] = {
                        pattern: pattern,
                        related: false
                    };
                }
                related = element.data('binding')[prop].related;
            }
            var result = pattern.replace(reg, function ($0, $1) {
                if (!related) {
                    _this.setRelation($1, element);
                    element.data('binding')[prop].related = true;
                }
                var nodes = $1.split('.');
                return nodes.reduce(function (obj, current) {
                    return obj[current];
                }, data);
            });
            return result;
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
                if (relation[0].elements.indexOf(element) < 0) {
                    relation[0].elements.push(element);
                }
            }
        };
        return VM;
    }());
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));
