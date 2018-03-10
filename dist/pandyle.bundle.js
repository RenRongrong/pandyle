var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Pandyle;
(function (Pandyle) {
    Pandyle._variables = {};
    Pandyle._methods = {};
    Pandyle._filters = {};
    Pandyle._converters = {};
    Pandyle._components = {};
    function getMethod(name) {
        return Pandyle._methods[name];
    }
    Pandyle.getMethod = getMethod;
    function hasSuffix(target, suffix) {
        var reg = new RegExp('^\\w+' + suffix + '$');
        return reg.test(target);
    }
    Pandyle.hasSuffix = hasSuffix;
    function register(name, value) {
        if ($.isFunction(value)) {
            if (hasSuffix(name, 'Filter')) {
                Pandyle._filters[name] = value;
            }
            else if (hasSuffix(name, 'Converter')) {
                Pandyle._converters[name] = value;
            }
            else {
                Pandyle._methods[name] = value;
            }
        }
        else {
            Pandyle._variables[name] = value;
        }
    }
    Pandyle.register = register;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    function hasComponent(name) {
        return typeof Pandyle._components[name] !== 'undefined';
    }
    Pandyle.hasComponent = hasComponent;
    function addComponent(com) {
        Pandyle._components[com.name] = com.html;
    }
    Pandyle.addComponent = addComponent;
    function getComponent(name) {
        return Pandyle._components[name];
    }
    Pandyle.getComponent = getComponent;
    function loadComponent(ele) {
        return __awaiter(this, void 0, void 0, function () {
            var name, url, res, text;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        name = $(ele).attr('p-com');
                        if (!hasComponent(name)) return [3, 1];
                        $(ele).html(getComponent(name));
                        return [3, 4];
                    case 1:
                        url = '';
                        if (/.*\.html$/.test(name)) {
                            url = name;
                        }
                        else {
                            url = '/components/' + name + '.html';
                        }
                        return [4, fetch(url)];
                    case 2:
                        res = _a.sent();
                        return [4, res.text()];
                    case 3:
                        text = _a.sent();
                        text = text.replace(/<\s*script\s*>((?:.|\r|\n)*?)<\/script\s*>/g, function ($0, $1) {
                            (new Function($1))();
                            return '';
                        });
                        addComponent({
                            name: name,
                            html: text
                        });
                        $(ele).html(text);
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    }
    Pandyle.loadComponent = loadComponent;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var Inputs = (function () {
        function Inputs(element) {
            this._data = {};
            this.initData(element);
            this.bindChange(element);
        }
        Object.defineProperty(Inputs.prototype, "data", {
            get: function () {
                return $.extend({}, this._data);
            },
            enumerable: true,
            configurable: true
        });
        Inputs.prototype.initData = function (element) {
            var _this = this;
            element.find('input,textarea,select').each(function (index, ele) {
                var target = $(ele);
                var tag = target.prop('tagName');
                switch (tag) {
                    case 'INPUT':
                        _this.initData_input(target);
                        break;
                    case 'TEXTAREA':
                        _this.initData_normal(target);
                        break;
                    case 'SELECT':
                        break;
                    default:
                        break;
                }
            });
        };
        Inputs.prototype.initData_input = function (element) {
            var type = element.prop('type');
            switch (type) {
                case 'radio':
                    this.initData_radio(element);
                    break;
                case 'checkbox':
                    this.initData_check(element);
                    break;
                default:
                    this.initData_normal(element);
                    break;
            }
        };
        Inputs.prototype.initData_radio = function (element) {
            var name = element.prop('name');
            var value = element.val();
            if (!this._data[name]) {
                this._data[name] = '';
            }
            if (element.prop('checked')) {
                this._data[name] = value;
            }
        };
        Inputs.prototype.initData_check = function (element) {
            var name = element.prop('name');
            var value = element.val();
            if (!this._data[name]) {
                this._data[name] = [];
            }
            if (element.prop('checked')) {
                this._data[name].push(value);
            }
        };
        Inputs.prototype.initData_normal = function (element) {
            var name = element.prop('name');
            var value = element.val();
            this._data[name] = value;
        };
        Inputs.prototype.bindChange = function (element) {
            var _this = this;
            element.on('change', 'input,textarea,select', function (e) {
                var ele = $(e.currentTarget);
                var tagName = ele.prop('tagName');
                switch (tagName) {
                    case 'INPUT':
                        _this.onChange_input(ele);
                        break;
                    case 'TEXTAREA':
                        _this.onChange_normal(ele);
                        break;
                    case 'SELECT':
                        _this.onChange_select(ele);
                        break;
                }
            });
        };
        Inputs.prototype.onChange_normal = function (element) {
            var name = element.prop('name');
            var value = element.val();
            this._data[name] = value;
        };
        Inputs.prototype.onChange_input = function (element) {
            switch (element.prop('type')) {
                case 'radio':
                    this.onChange_radio(element);
                    break;
                case 'checkbox':
                    this.onChange_check(element);
                    break;
                default:
                    this.onChange_normal(element);
                    break;
            }
        };
        Inputs.prototype.onChange_radio = function (element) {
            var name = element.prop('name');
            var value = element.val();
            if (element.prop('checked')) {
                this._data[name] = value;
            }
        };
        Inputs.prototype.onChange_check = function (element) {
            var name = element.prop('name');
            var value = element.val();
            if (element.prop('checked')) {
                this._data[name].push(value);
            }
            else {
                var index = this._data[name].indexOf(value);
                this._data[name].splice(index, 1);
            }
        };
        Inputs.prototype.onChange_select = function (element) {
        };
        return Inputs;
    }());
    Pandyle.Inputs = Inputs;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var VM = (function () {
        function VM(element, data, autoRun) {
            if (autoRun === void 0) { autoRun = true; }
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
                        _this.render(ele);
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
                _this.renderSingle(ele, data, parentProperty);
            });
        };
        VM.prototype.renderSingle = function (ele, data, parentProperty) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!$(ele).data('context')) {
                                $(ele).data('context', data);
                            }
                            if (!$(ele).data('binding')) {
                                $(ele).data('binding', {});
                            }
                            data = $(ele).data('context');
                            this.bindAttr(ele, parentProperty);
                            this.bindIf(ele, parentProperty);
                            if (!($(ele)[0].tagName === 'C')) return [3, 2];
                            return [4, Pandyle.loadComponent(ele)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if ($(ele).attr('p-context')) {
                                this.renderContext(ele, parentProperty);
                            }
                            else if ($(ele).attr('p-each')) {
                                this.renderEach($(ele), data, parentProperty);
                            }
                            else if ($(ele).children().length > 0) {
                                this.renderChild(ele, data, parentProperty);
                            }
                            else {
                                this.renderText($(ele), parentProperty);
                            }
                            return [2];
                    }
                });
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
                if (a !== 'text' && a !== 'if') {
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
        VM.prototype.renderContext = function (ele, parentProperty) {
            if ($(ele).attr('p-context')) {
                var data = $(ele).data('context');
                var expression = $(ele).attr('p-context');
                var divided = this.dividePipe(expression);
                var property = divided.property;
                var method = divided.method;
                var nodes = property.split('.');
                var target = nodes.reduce(function (obj, current) {
                    return obj[current];
                }, data);
                if (method) {
                    target = this.convert(method, target);
                }
                var fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }
                this.setRelation(property, $(ele), parentProperty);
                this.renderChild(ele, target, fullProp);
            }
        };
        VM.prototype.renderChild = function (ele, data, parentProperty) {
            if ($(ele).children().length > 0) {
                var _this_1 = this;
                var f_1 = function (child) {
                    return __awaiter(this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    child.data('context', data);
                                    return [4, _this_1.renderSingle(child[0], data, parentProperty)];
                                case 1:
                                    _a.sent();
                                    if (child.next().length > 0) {
                                        f_1(child.next());
                                    }
                                    return [2];
                            }
                        });
                    });
                };
                f_1($(ele).children().first());
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
                    if (parentProperty !== '') {
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
            var reg = /{{\s*([\w\.\[\]\(\)\,\$@\{\}\d\+\-\*\/\s]*)\s*}}/g;
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
            if (/^@root.*/.test(property)) {
                property = property.replace(/@root\.?/, '');
            }
            else if (/^@self.*/.test(property)) {
                property = property.replace(/@self\.?/, parentProperty);
            }
            else if (parentProperty != '') {
                property = parentProperty + '.' + property;
            }
            var relation = this._relations.filter(function (value) { return value.property === property; });
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
            var nodes = property.match(/[@\w]+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            var result = nodes.reduce(function (obj, current) {
                var arr = /^([@\w]+)([\(|\[].*)*/.exec(current);
                var property = arr[1];
                var tempData;
                switch (property) {
                    case '@root':
                        tempData = _this._data;
                        break;
                    case '@self':
                        tempData = obj;
                        break;
                    case '@window':
                        tempData = window;
                        break;
                    default:
                        tempData = obj[property];
                }
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
                            var func = obj2 || _this.getMethod(property) || Pandyle.getMethod(property) || window[property];
                            return func.apply(_this, computedParams);
                        }
                    }, tempData);
                }
                else {
                    return tempData;
                }
            }, data);
            var type = $.type(result);
            if (type === 'string' || type === 'number' || type === 'boolean') {
                return result;
            }
            else {
                return $.extend(this.toDefault(type), result);
            }
        };
        VM.prototype.toDefault = function (type) {
            switch (type) {
                case 'string':
                    return '';
                case 'number':
                    return 0;
                case 'boolean':
                    return false;
                case 'array':
                    return [];
                case 'object':
                    return {};
                case 'function':
                    return function () { };
                default:
                    return null;
            }
        };
        VM.prototype.getMethod = function (name) {
            return this._methods[name];
        };
        VM.prototype.dividePipe = function (expression) {
            var array = expression.split('|');
            var property = array[0].replace(/\s/g, '');
            var method = array[1] ? array[1].replace(/\s/g, '') : null;
            return {
                property: property,
                method: method
            };
        };
        VM.prototype.convert = function (method, data) {
            if (/^{.*}$/.test(method)) {
                var pairs = method.replace(/{|}/g, '').split(',');
                return pairs.reduce(function (pre, current) {
                    var pair = current.split(':');
                    pre[pair[0]] = pair[1].split('.').reduce(function (predata, property) {
                        return predata[property];
                    }, data);
                    return pre;
                }, {});
            }
            else {
                if (!Pandyle.hasSuffix(method, 'Converter')) {
                    method += 'Converter';
                }
                return this._converters[method](data);
            }
        };
        VM.prototype.register = function (name, value) {
            if ($.isFunction(value)) {
                if (Pandyle.hasSuffix(name, 'Filter')) {
                    this._filters[name] = value;
                }
                else if (Pandyle.hasSuffix(name, 'Converter')) {
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
