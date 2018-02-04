var Pandyle;
(function (Pandyle) {
    var _variables = {};
    var _methods = {};
    var _filters = {};
    var _converters = {};
    function getMethod(name) {
        return _methods[name];
    }
    function hasSuffix(target, suffix) {
        var reg = new RegExp('/^\w+' + suffix + '$/');
        return reg.test(target);
    }
    function register(name, value) {
        if ($.isFunction(value)) {
            if (hasSuffix(name, 'Filter')) {
                _filters[name] = value;
            }
            else if (hasSuffix(name, 'Converter')) {
                _converters[name] = value;
            }
            else {
                _methods[name] = value;
            }
        }
        else {
            _variables[name] = value;
        }
    }
    Pandyle.register = register;
    var VM = (function () {
        function VM(element, data, autoRun) {
            if (autoRun === void 0) { autoRun = false; }
            this._data = data;
            this._root = element;
            this._relations = [];
            this._methods = {};
            this._filters = {};
            this._converters = {};
            this._variables = {};
            if (autoRun) {
                this.run();
            }
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
                if ($.isArray(target[lastProperty])) {
                    for (var i = this_1._relations.length - 1; i >= 0; i--) {
                        if (this_1.isChild(key, this_1._relations[i].property)) {
                            this_1._relations.splice(i, 1);
                        }
                    }
                }
                var relation = this_1._relations.filter(function (value) { return _this.isSelfOrChild(key, value.property); });
                if (relation.length > 0) {
                    relation[0].elements.forEach(function (ele) {
                        _this.render(ele, _this._data, '');
                    });
                }
            };
            var this_1 = this;
            for (var key in newData) {
                _loop_1(key);
            }
        };
        VM.prototype.get = function (param) {
            var _this = this;
            switch ($.type(param)) {
                case 'array':
                    return param.map(function (value) { return _this.get(value); });
                case 'string':
                    return this.getValue(param, this._data);
                case 'object':
                    var result = {};
                    for (var key in param) {
                        result[key] = this.getValue(param[key], this._data);
                    }
                    return result;
                default:
                    return null;
            }
        };
        VM.prototype.run = function () {
            this.render(this._root, this._data, '');
        };
        VM.prototype.render = function (element, data, parentProperty) {
            var _this = this;
            element.each(function (index, ele) {
                if (!$(ele).data('context')) {
                    $(ele).data('context', data);
                }
                if (!$(ele).data('binding')) {
                    $(ele).data('binding', {});
                }
                _this.bindAttr(ele, parentProperty);
                _this.bindIf(ele, parentProperty);
                if ($(ele).attr('p-each')) {
                    _this.renderEach($(ele), data, parentProperty);
                }
                else if ($(ele).children().length > 0) {
                    for (var i = 0; i < $(ele).children().length; i++) {
                        var child = $($(ele).children()[i]);
                        child.data('context', data);
                        _this.render(child, data, parentProperty);
                    }
                }
                else {
                    _this.renderText($(ele), parentProperty);
                }
            });
        };
        VM.prototype.bindAttr = function (ele, parentProperty) {
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
            }
            var bindings = $(ele).data('binding');
            var data = $(ele).data('context');
            for (var a in bindings) {
                if (a != 'text' && a != 'if') {
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a].pattern, data, parentProperty));
                }
            }
        };
        VM.prototype.bindIf = function (ele, parentProperty) {
            if ($(ele).attr('p-if')) {
                $(ele).data('binding')['if'] = {
                    pattern: $(ele).attr('p-if'),
                    related: false
                };
                $(ele).removeAttr('p-if');
            }
            if ($(ele).data('binding')['if']) {
                var expression = $(ele).data('binding')['if'].pattern;
                var data = $(ele).data('context');
                var convertedExpression = this.convertFromPattern($(ele), 'if', expression, data, parentProperty);
                var judge = new Function('return ' + convertedExpression);
                if (judge()) {
                    $(ele).show();
                }
                else {
                    $(ele).hide();
                }
            }
        };
        VM.prototype.renderEach = function (element, data, parentProperty) {
            if (element.attr('p-each')) {
                var property = element.attr('p-each').replace(/\s/g, '');
                var nodes = property.split('.');
                var target = nodes.reduce(function (obj, current) {
                    return obj[current];
                }, data);
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this.setRelation(property, element, parentProperty);
                }
                var htmlText = element.data('pattern');
                var children = $('<div />').html(htmlText).children();
                element.children().remove();
                for (var i = 0; i < target.length; i++) {
                    var newChildren = children.clone(true, true);
                    element.append(newChildren);
                    var fullProp = property;
                    if (parentProperty != '') {
                        fullProp = parentProperty + '.' + property;
                    }
                    this.render(newChildren, target[i], fullProp.concat('[', i.toString(), ']'));
                }
            }
        };
        VM.prototype.renderText = function (element, parentProperty) {
            var data = element.data('context');
            var text = element.text();
            if (element.data('binding').text) {
                text = element.data('binding').text.pattern;
            }
            var result = this.convertFromPattern(element, 'text', text, data, parentProperty);
            element.text(result);
        };
        VM.prototype.convertFromPattern = function (element, prop, pattern, data, parentProperty) {
            var _this = this;
            var reg = /{{\s*([\w\.\[\]\(\)\,\$\{\}\d\+\-\*\/\s]*)\s*}}/g;
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
                    _this.setRelation($1, element, parentProperty);
                    element.data('binding')[prop].related = true;
                }
                return _this.getValue($1, data);
            });
            return result;
        };
        VM.prototype.setRelation = function (property, element, parentProperty) {
            if (parentProperty != '') {
                property = parentProperty + '.' + property;
            }
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
        VM.prototype.isSelfOrChild = function (property, subProperty) {
            var reg = new RegExp('^' + property + '$' + '|' + '^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        };
        VM.prototype.isChild = function (property, subProperty) {
            var reg = new RegExp('^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        };
        VM.prototype.getValue = function (property, data) {
            var _this = this;
            //let nodes = property.split('.');
            var nodes = property.match(/\w+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            return nodes.reduce(function (obj, current) {
                var arr = /^(\w+)([\(|\[].*)*/.exec(current);
                var property = arr[1];
                var tempData = obj[property];
                var symbols = arr[2];
                if (symbols) {
                    var arr_1 = symbols.match(/\[\d+\]|\(.*\)/g);
                    return arr_1.reduce(function (obj2, current2) {
                        if (/\[\d+\]/.test(current2)) {
                            var arrayIndex = parseInt(current2.replace(/\[(\d+)\]/, '$1'));
                            return obj2[arrayIndex];
                        }
                        else if (/\(.*\)/.test(current2)) {
                            var params = current2.replace(/\((.*)\)/, '$1').replace(/\s/, '').split(',');
                            var computedParams = params.map(function (p) {
                                if (/^[A-Za-z_\$].*$/.test(p)) {
                                    return _this.getValue(p, data);
                                }
                                else {
                                    return (new Function('return ' + p))();
                                }
                            });
                            var func = obj2 || _this.getMethod(property) || getMethod(property) || window[property];
                            return func.apply(_this, computedParams);
                        }
                    }, tempData);
                }
                else {
                    return tempData;
                }
            }, data);
        };
        VM.prototype.getMethod = function (name) {
            return this._methods[name];
        };
        VM.prototype.register = function (name, value) {
            if ($.isFunction(value)) {
                if (hasSuffix(name, 'Filter')) {
                    this._filters[name] = value;
                }
                else if (hasSuffix(name, 'Converter')) {
                    this._converters[name] = value;
                }
                else {
                    this._methods[name] = value;
                }
            }
            else {
                this._variables[name] = value;
            }
        };
        return VM;
    }());
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));
