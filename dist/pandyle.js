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
var Pandyle;
(function (Pandyle) {
    Pandyle._variables = {};
    Pandyle._methods = {};
    Pandyle._filters = {};
    Pandyle._converters = {};
    Pandyle._components = {};
    Pandyle._config = {};
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
        if (Pandyle.$.isFunction(value)) {
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
    function config(options) {
        for (var item in options) {
            Pandyle._config[item] = options[item];
        }
    }
    Pandyle.config = config;
    function getDomData(element) {
        if (!element.data('pandyle')) {
            element.data('pandyle', {});
        }
        return element.data('pandyle');
    }
    Pandyle.getDomData = getDomData;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var Component = (function () {
        function Component(name, html) {
            this.name = name;
            this.html = html;
        }
        Component.prototype.setPrivateData = function (element, data) {
            Pandyle.getDomData(element).alias.private = {
                data: data
            };
        };
        Component.prototype.afterRender = function (element, handler) {
            Pandyle.getDomData(element).afterRender = handler;
        };
        Component.prototype.getPrivateData = function (root) {
            return Pandyle.getDomData(root).alias.private.data;
        };
        return Component;
    }());
    Pandyle.Component = Component;
    function hasComponent(name) {
        return typeof Pandyle._components[name] !== 'undefined';
    }
    Pandyle.hasComponent = hasComponent;
    function addComponent(com) {
        Pandyle._components[com.name] = com;
    }
    Pandyle.addComponent = addComponent;
    function getComponent(name) {
        return Pandyle._components[name];
    }
    Pandyle.getComponent = getComponent;
    function loadComponent(ele, vm) {
        var element = Pandyle.$(ele);
        var name = element.attr('p-com');
        var domData = Pandyle.getDomData(element);
        if (name === domData.componentName) {
            return;
        }
        else {
            domData.componentName = name;
        }
        element.children().remove();
        var context = domData.context;
        name = Pandyle.$.trim(name);
        if (hasComponent(name)) {
            var com = getComponent(name);
            element.html(com.html);
            var children = element.children();
            children.each(function (index, item) {
                var childrenDomData = Pandyle.getDomData(Pandyle.$(item));
                childrenDomData.context = context;
            });
            domData.children = children;
            if (com.onLoad) {
                com.onLoad(context, ele, vm);
            }
        }
        else {
            var url = '';
            if (/^@.*/.test(name)) {
                url = name.replace(/^@/, '');
            }
            else {
                var fullpath = name.split('.');
                var path = Pandyle._config.comPath
                    ? Pandyle._config.comPath['Default'] || './components/{name}.html'
                    : './components/{name}.html';
                if (fullpath.length > 1) {
                    path = Pandyle._config.comPath[fullpath[0]];
                    url = path.replace(/{.*}/g, fullpath[1]);
                }
                else {
                    url = path.replace(/{.*}/g, name);
                }
            }
            Pandyle.$.ajax({
                url: url,
                async: false,
                success: function (res) {
                    insertToDom(res, name, context, ele, vm);
                }
            });
        }
        function insertToDom(text, name, context, root, vm) {
            var component = new Component(name, text);
            text = text.replace(/<\s*style\s*>((?:.|\r|\n)*?)<\/style\s*>/g, function ($0, $1) {
                Pandyle.$('head').append($0);
                return '';
            });
            text = text.replace(/<\s*link.*href\s*\=\s*["'](.*)["'].*>/g, function ($0, $1) {
                if (Pandyle.$('head link[href="' + $1 + '"]').length === 0) {
                    Pandyle.$('head').append($0);
                }
                return '';
            });
            text = text.replace(/<\s*script.*src\s*\=\s*["'](.*)["'].*><\/script\s*>/g, function ($0, $1) {
                if (Pandyle.$('head script[src="' + $1 + '"]').length === 0) {
                    Pandyle.$('head').append($0);
                }
                return '';
            });
            text = text.replace(/<\s*script\s*>((?:.|\r|\n)*?)<\/script\s*>/g, function ($0, $1) {
                new Function($1).call(component);
                return '';
            });
            component.html = text;
            addComponent(component);
            element.html(text);
            var children = element.children();
            children.each(function (index, item) {
                Pandyle.getDomData(Pandyle.$(item)).context = context;
            });
            Pandyle.getDomData(element).children = children;
            if (component.onLoad) {
                component.onLoad(context, root, vm);
            }
        }
    }
    Pandyle.loadComponent = loadComponent;
})(Pandyle || (Pandyle = {}));
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    }
    else if (typeof exports === 'object' && typeof module === 'object') {
        exports = module.exports = factory(require('jquery'));
    }
    else {
        factory(root.jQuery);
    }
})(this, function ($) {
    Pandyle.$ = $;
    $.fn.vm = function (data, autoRun) {
        if (autoRun === void 0) { autoRun = true; }
        var element = this;
        if (element.data('vm')) {
            return element.data('vm');
        }
        else {
            var vm = new Pandyle.VM(element, data, autoRun);
            element.data('vm', vm);
            return vm;
        }
    };
    $.fn.inputs = function () {
        var element = this;
        if (element.data('inputs')) {
            return element.data('inputs');
        }
        else {
            var inputs = new Pandyle.Inputs(element);
            element.data('inputs', inputs);
            return inputs;
        }
    };
    return Pandyle;
});
var Pandyle;
(function (Pandyle) {
    var Inputs = (function () {
        function Inputs(element) {
            this._data = {};
            this._root = element;
            this.initData();
            this.bindChange();
        }
        Inputs.prototype.data = function () {
            return Pandyle.$.extend(true, {}, this._data);
        };
        Inputs.prototype.set = function (data) {
            for (var key in data) {
                this.setData(key, data[key]);
                var elements = this._root.find('[name="' + key + '"]');
                this.updateDom(elements, data[key]);
                elements.trigger('modelChange', data[key]);
            }
        };
        Inputs.prototype.refresh = function () {
            this._data = {};
            this.initData();
        };
        Inputs.prototype.initData = function () {
            var _this = this;
            this._root.find('input,textarea,select').each(function (index, ele) {
                var target = Pandyle.$(ele);
                var tag = target.prop('tagName');
                var name = target.prop('name');
                if (name) {
                    var value = target.val() || '';
                    _this.initName(name);
                    switch (tag) {
                        case 'INPUT':
                            _this.initData_input(target, name, value);
                            break;
                        case 'TEXTAREA':
                            _this.initData_normal(target, name, value);
                            break;
                        case 'SELECT':
                            _this.initData_select(target, name, value);
                            break;
                        default:
                            break;
                    }
                }
            });
        };
        Inputs.prototype.initData_input = function (element, name, value) {
            var type = element.prop('type');
            switch (type) {
                case 'radio':
                    this.initData_radio(element, name, value);
                    break;
                case 'checkbox':
                    this.initData_check(element, name, value);
                    break;
                default:
                    this.initData_normal(element, name, value);
                    break;
            }
        };
        Inputs.prototype.initData_radio = function (element, name, value) {
            if (Pandyle.$.isEmptyObject(this.getDataByName(name))) {
                this.setData(name, '');
            }
            if (element.prop('checked')) {
                this.setData(name, value);
            }
        };
        Inputs.prototype.initData_check = function (element, name, value) {
            if (Pandyle.$('input[name="' + name + '"]').length === 1) {
                this.setData(name, element.prop('checked') ? true : false);
            }
            else {
                if (Pandyle.$.isEmptyObject(this.getDataByName(name))) {
                    this.setData(name, []);
                }
                if (element.prop('checked')) {
                    this.getDataByName(name).push(value);
                }
            }
        };
        Inputs.prototype.initData_normal = function (element, name, value) {
            this.setData(name, value);
        };
        Inputs.prototype.initData_select = function (element, name, value) {
            this.setData(name, value);
        };
        Inputs.prototype.bindChange = function () {
            var _this = this;
            this._root.on('change viewChange keyup', 'input,textarea,select', function (e) {
                var ele = Pandyle.$(e.currentTarget);
                var tagName = ele.prop('tagName');
                var name = ele.prop('name');
                var value = ele.val();
                switch (tagName) {
                    case 'INPUT':
                        _this.onChange_input(ele, name, value);
                        break;
                    case 'TEXTAREA':
                        _this.onChange_normal(ele, name, value);
                        break;
                    case 'SELECT':
                        _this.onChange_select(ele, name, value);
                        break;
                }
                if (_this.callBack) {
                    _this.callBack(name, _this.getDataByName(name));
                }
            });
        };
        Inputs.prototype.onChange_normal = function (element, name, value) {
            this.setData(name, value);
        };
        Inputs.prototype.onChange_input = function (element, name, value) {
            switch (element.prop('type')) {
                case 'radio':
                    this.onChange_radio(element, name, value);
                    break;
                case 'checkbox':
                    this.onChange_check(element, name, value);
                    break;
                default:
                    this.onChange_normal(element, name, value);
                    break;
            }
        };
        Inputs.prototype.onChange_radio = function (element, name, value) {
            if (element.prop('checked')) {
                this.setData(name, value);
            }
        };
        Inputs.prototype.onChange_check = function (element, name, value) {
            var data = this.getDataByName(name);
            if (Pandyle.$.type(data) === 'boolean') {
                this.setData(name, !data);
            }
            else {
                if (element.prop('checked')) {
                    data.push(value);
                }
                else {
                    var index = data.indexOf(value);
                    data.splice(index, 1);
                }
            }
        };
        Inputs.prototype.onChange_select = function (element, name, value) {
            this.setData(name, value);
        };
        Inputs.prototype.initName = function (name) {
            name.split('.').reduce(function (obj, current) {
                if (obj[current]) {
                    return obj[current];
                }
                else {
                    obj[current] = {};
                    return obj[current];
                }
            }, this._data);
        };
        Inputs.prototype.getDataByName = function (name) {
            return name.split('.').reduce(function (obj, current) {
                return obj[current];
            }, this._data);
        };
        Inputs.prototype.setData = function (name, value) {
            var nodes = name.split('.');
            var property = nodes.pop();
            var data = nodes.reduce(function (obj, current) {
                return obj[current];
            }, this._data);
            data[property] = value;
        };
        Inputs.prototype.updateDom = function (element, value) {
            var tag = element.prop('tagName');
            switch (tag) {
                case 'INPUT':
                    this.updateDom_input(element, value);
                    break;
                case 'TEXTAREA':
                    this.updateDom_normal(element, value);
                    break;
                case 'SELECT':
                    this.updateDom_select(element, value);
                    break;
                default:
                    this.updateDom_normal(element, value);
            }
        };
        Inputs.prototype.updateDom_input = function (element, value) {
            var type = element.prop('type');
            switch (type) {
                case 'radio':
                    this.updateDom_radio(element, value);
                    break;
                case 'checkbox':
                    this.updateDom_check(element, value);
                    break;
                default:
                    this.updateDom_normal(element, value);
                    break;
            }
        };
        Inputs.prototype.updateDom_radio = function (element, value) {
            element.each(function (index, ele) {
                var target = Pandyle.$(ele);
                if (target.val() == value) {
                    target.prop('checked', 'checked');
                }
                else {
                    target.prop('checked', false);
                }
            });
        };
        Inputs.prototype.updateDom_check = function (element, value) {
            element.each(function (index, ele) {
                var target = Pandyle.$(ele);
                if (value.indexOf(target.val()) > -1) {
                    target.prop('checked', 'checked');
                }
                else {
                    target.prop('checked', false);
                }
            });
        };
        Inputs.prototype.updateDom_normal = function (element, value) {
            element.val(value);
        };
        Inputs.prototype.updateDom_select = function (element, value) {
            element.val(value);
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
            this._data = Pandyle.$.extend({}, data);
            this._root = element;
            this._methods = {};
            this._variables = {};
            this._defaultAlias = {
                root: {
                    data: this._data,
                    property: ''
                },
                window: {
                    data: window,
                    property: '@window'
                }
            };
            this._util = Pandyle.Util.CreateUtil(this);
            this._renderer = new Pandyle.Renderer(this);
            if (autoRun) {
                this.run();
            }
        }
        VM.prototype.get = function (param) {
            var _this = this;
            if (!param) {
                return Pandyle.$.extend({}, this._data);
            }
            switch (Pandyle.$.type(param)) {
                case 'array':
                    return param.map(function (value) { return _this.get(value); });
                case 'string':
                    return this._util.getValue(this._root, param, this._data);
                case 'object':
                    var result = {};
                    for (var key in param) {
                        result[key] = this._util.getValue(this._root, param[key], this._data);
                    }
                    return result;
                default:
                    return null;
            }
        };
        VM.prototype.append = function (target, value) {
            var _this = this;
            target.each(function (index, item) {
                var domData = Pandyle.getDomData(Pandyle.$(item));
                var context = domData.context;
                if (domData.binding['For']) {
                    var arrayName = domData.binding['For'].pattern;
                    context[arrayName].push(value);
                    var newChildren = Pandyle.iteratorBase.generateChild(domData, Pandyle.$(item).children().length, value);
                    domData.children.last().after(newChildren);
                    var arr = [];
                    arr.push.call(domData.children, newChildren);
                    _this.render(Pandyle.$(newChildren));
                }
                else {
                    var arrayName = domData.binding['Each'].pattern;
                    context[arrayName].push(value);
                    var newChildren = Pandyle.iteratorBase.generateChild(domData, Pandyle.$(item).children().length, value);
                    Pandyle.$(item).append(newChildren);
                    _this.render(Pandyle.$(newChildren));
                }
            });
        };
        VM.prototype.appendArray = function (target, value) {
            var _this = this;
            target.each(function (index, item) {
                var domData = Pandyle.getDomData(Pandyle.$(item));
                var context = domData.context;
                if (domData.binding['For']) {
                    var arrayName_1 = domData.binding['For'].pattern;
                    value.forEach(function (val) {
                        context[arrayName_1].push(val);
                        var newChildren = Pandyle.iteratorBase.generateChild(domData, Pandyle.$(item).children().length, val);
                        domData.children.last().after(newChildren);
                        var arr = [];
                        arr.push.call(domData.children, newChildren);
                        _this.render(Pandyle.$(newChildren));
                    });
                }
                else {
                    var arrayName_2 = domData.binding['Each'].pattern;
                    value.forEach(function (val) {
                        context[arrayName_2].push(val);
                        var newChildren = Pandyle.iteratorBase.generateChild(domData, Pandyle.$(item).children().length, val);
                        Pandyle.$(item).append(newChildren);
                        _this.render(Pandyle.$(newChildren));
                    });
                }
            });
        };
        VM.prototype.run = function () {
            this.render(this._root, this._data, this._defaultAlias);
        };
        VM.prototype.render = function (element, data, alias) {
            var _this = this;
            element.each(function (index, ele) {
                _this._renderer.renderSingle(ele, data, Pandyle.$.extend({}, alias));
            });
        };
        VM.prototype.getMethod = function (name) {
            return this._methods[name];
        };
        VM.prototype.transfer = function (method, data) {
            return this._methods[method](data);
        };
        VM.prototype.register = function (name, value) {
            if (Pandyle.$.isFunction(value)) {
                this._methods[name] = value;
            }
            else {
                this._variables[name] = value;
            }
        };
        return VM;
    }());
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var Util = (function () {
        function Util(vm) {
            this.vm = vm;
        }
        Util.CreateUtil = function (vm) {
            var util = new Util(vm);
            return util;
        };
        Util.prototype.getValue = function (element, property, data) {
            var result = this.calcuExpression(property, element, data);
            var type = Pandyle.$.type(result);
            if (type === 'string') {
                result = unescape(result);
            }
            if (type === 'string' || type === 'number' || type === 'boolean' || type === 'null' || type === 'undefined') {
                return result;
            }
            else {
                return Pandyle.$.extend(this.toDefault(type), result);
            }
        };
        Util.prototype.calcuExpression = function (property, element, data) {
            var _this = this;
            var reg = /([^\+\-\*\/\?\:\>\=\<\!]|(\|\|)|(\&\&))+/g;
            var reg2 = /[\+\-\*\/\?\:\>\=\<\!]|(\|\|)|(\&\&)/g;
            if (reg2.test(property)) {
                var funcStr = property.replace(reg, function ($0) {
                    var result = _this.calcu($0, element, data);
                    if (Pandyle.$.type(result) === 'string') {
                        result = "'" + escape(result) + "'";
                    }
                    return result;
                });
                return new Function('return ' + funcStr)();
            }
            else {
                return this.calcu(property, element, data);
            }
        };
        Util.prototype.calcu = function (property, element, data) {
            var _this = this;
            var devided = this.dividePipe(property);
            property = devided.property;
            if (['null', 'undefined', 'true', 'false'].indexOf(property) > -1) {
                return new Function('return ' + property)();
            }
            if (property.match(/^('|"|\d).*$/)) {
                return new Function('return ' + property)();
            }
            var method = devided.method;
            var nodes = property.match(/[@\w]+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            if (!nodes) {
                return property;
            }
            var result = nodes.reduce(function (obj, current) {
                var arr = /^([@\w]+)([\(|\[].*)*/.exec(current);
                var property = arr[1];
                var tempData;
                if (/^@.*/.test(property)) {
                    tempData = _this.getAliasData(element, property.substr(1));
                }
                else {
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
                                if (/^[A-Za-z_\$\@].*$/.test(p)) {
                                    return _this.calcu(p, element, data);
                                }
                                else {
                                    if (p === '') {
                                        p = '""';
                                    }
                                    return (new Function('return ' + p))();
                                }
                            });
                            var func = obj2 || _this.vm.getMethod(property) || Pandyle.getMethod(property) || window[property];
                            return func.apply(_this, computedParams);
                        }
                    }, tempData);
                }
                else {
                    return tempData;
                }
            }, data);
            if (method) {
                return this.transfer(method, result);
            }
            else {
                return result;
            }
        };
        Util.prototype.convertFromPattern = function (element, prop, pattern, data) {
            var _this = this;
            var reg = /{{\s*(.*?)\s*}}/g;
            var domData = Pandyle.getDomData(element);
            if (reg.test(pattern)) {
                if (!domData.binding[prop]) {
                    domData.binding[prop] = {
                        pattern: pattern
                    };
                }
            }
            var result = pattern.replace(reg, function ($0, $1) {
                return _this.getValue(element, $1, data);
            });
            return result;
        };
        Util.prototype.toDefault = function (type) {
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
        Util.prototype.setAlias = function (element, data) {
            var domData = Pandyle.getDomData(element);
            var targetData = data || domData.context;
            domData.alias.self = {
                data: targetData
            };
            if (element.attr('p-as')) {
                var alias = element.attr('p-as');
                domData.alias[alias] = {
                    data: targetData
                };
            }
        };
        Util.prototype.getAliasData = function (element, alias) {
            var domData = Pandyle.getDomData(element);
            return domData.alias[alias].data;
        };
        Util.prototype.dividePipe = function (expression) {
            var array = expression.split('|');
            var property = array[0].replace(/\s/g, '');
            var method = array[1] ? array[1].replace(/\s/g, '') : null;
            return {
                property: property,
                method: method
            };
        };
        Util.prototype.convert = function (method, data) {
            if (/^{.*}$/.test(method)) {
                var pairs = method.replace(/{|}/g, '').split(',');
                return pairs.reduce(function (pre, current) {
                    var pair = current.split(':');
                    if (/^[a-zA-z$_]+/.test(pair[1])) {
                        pre[pair[0]] = pair[1].split('.').reduce(function (predata, property) {
                            return predata[property];
                        }, data);
                    }
                    else {
                        pre[pair[0]] = new Function('return ' + pair[1])();
                    }
                    return pre;
                }, {});
            }
            else {
                return this.vm._methods[method](data);
            }
        };
        Util.prototype.isSelfOrChild = function (property, subProperty) {
            property = property.replace(/[\[\]\(\)\.]/g, function ($0) {
                return '\\' + $0;
            });
            var reg = new RegExp('^' + property + '$' + '|' + '^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        };
        Util.prototype.isChild = function (property, subProperty) {
            var regStr = '^' + property.replace(/[\[\]\.]/g, function ($0) {
                return '\\' + $0;
            }) + '[\\[\\.]\\w+';
            var reg = new RegExp(regStr);
            return reg.test(subProperty);
        };
        Util.prototype.transfer = function (method, data) {
            return this.vm.transfer(method, data);
        };
        return Util;
    }());
    Pandyle.Util = Util;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var DirectiveBase = (function () {
        function DirectiveBase() {
        }
        DirectiveBase.prototype.next = function () {
            if (this._next) {
                this._next.init(this._context, this._util);
                this._next.execute();
            }
        };
        DirectiveBase.prototype.deep = function () {
        };
        DirectiveBase.prototype.error = function (directiveName, errorMessage, domData) {
            console.error("\u5728\u6267\u884C" + directiveName + "\u6307\u4EE4\u65F6\u53D1\u751F\u9519\u8BEF\u3002\u9519\u8BEF\u4FE1\u606F\uFF1A" + errorMessage);
            console.log('当前元素为：');
            console.log(this._context.element);
            console.log('当前元素的数据上下文：');
            console.log(domData);
        };
        DirectiveBase.prototype.append = function (next) {
            this._next = next;
        };
        DirectiveBase.prototype.init = function (context, util) {
            this._context = context;
            this._util = util;
        };
        return DirectiveBase;
    }());
    Pandyle.DirectiveBase = DirectiveBase;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var PBindDirective = (function (_super) {
        __extends(PBindDirective, _super);
        function PBindDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PBindDirective.prototype.execute = function () {
            var ele = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-bind')) {
                    var binds = Pandyle.$(ele).attr('p-bind').split('^');
                    binds.forEach(function (bindInfo, index) {
                        var array = bindInfo.match(/^\s*([\w-\?]+)\s*:\s*(.*)$/);
                        var attr = array[1];
                        var value = array[2].replace(/\s*$/, '');
                        domData.binding[attr] = {
                            pattern: value
                        };
                    });
                    ele.removeAttr('p-bind');
                }
                var bindings = domData.binding;
                var data = domData.context;
                for (var a in bindings) {
                    if (['text', 'If', 'Each', 'For', 'Context'].indexOf(a) < 0) {
                        var value = this._util.convertFromPattern(Pandyle.$(ele), a, bindings[a].pattern, data);
                        if (a.endsWith('?')) {
                            var attr = a.replace(/\?$/, '');
                            value == 'true' ? Pandyle.$(ele).attr(attr, attr) : Pandyle.$(ele).removeAttr(attr);
                        }
                        else {
                            Pandyle.$(ele).attr(a, value);
                        }
                    }
                }
                this.next();
            }
            catch (err) {
                this.error('p-bind', err.message, domData);
            }
        };
        return PBindDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.PBindDirective = PBindDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var pComDirective = (function (_super) {
        __extends(pComDirective, _super);
        function pComDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        pComDirective.prototype.execute = function () {
            var ele = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-com')) {
                    Pandyle.loadComponent(this._context.element, this._util.vm);
                }
                this.next();
            }
            catch (err) {
                this.error('p-com', err.message, domData);
            }
        };
        return pComDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.pComDirective = pComDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var pTextDirective = (function (_super) {
        __extends(pTextDirective, _super);
        function pTextDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        pTextDirective.prototype.execute = function () {
            var element = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(element);
            try {
                if (element.children().length === 0) {
                    var data = domData.context;
                    var text = element.text();
                    if (domData.binding['text']) {
                        text = domData.binding['text'].pattern;
                    }
                    var result = this._util.convertFromPattern(element, 'text', text, data);
                    element.text(result);
                }
            }
            catch (err) {
                this.error('文本插值', err.message, domData);
            }
        };
        return pTextDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.pTextDirective = pTextDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var PIfDirective = (function (_super) {
        __extends(PIfDirective, _super);
        function PIfDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PIfDirective.prototype.execute = function () {
            var ele = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-if')) {
                    domData.binding['If'] = {
                        pattern: ele.attr('p-if')
                    };
                    ele.removeAttr('p-if');
                }
                if (domData.binding['If']) {
                    var parentElement = ele.parent();
                    if (!domData.parent) {
                        domData.parent = parentElement;
                    }
                    var expression = domData.binding['If'].pattern;
                    var data = domData.context;
                    var convertedExpression = this._util.convertFromPattern(ele, 'If', expression, data);
                    var judge = new Function('return ' + convertedExpression);
                    if (judge()) {
                        if (ele.parent().length === 0) {
                            var pindex_1 = domData.pIndex;
                            var pre = domData.parent.children().filter(function (index, element) {
                                return Pandyle.getDomData(Pandyle.$(element)).pIndex === (pindex_1 - 1);
                            });
                            if (pre.length > 0) {
                                ele.insertAfter(pre);
                            }
                            else {
                                domData.parent.prepend(ele);
                            }
                        }
                        this.next();
                    }
                    else {
                        ele.detach();
                    }
                }
                else {
                    this.next();
                }
            }
            catch (err) {
                this.error('p-if', err.message, domData);
            }
        };
        return PIfDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.PIfDirective = PIfDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var iteratorBase = (function (_super) {
        __extends(iteratorBase, _super);
        function iteratorBase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        iteratorBase.prototype.execute = function () {
            var $this = this;
            var element = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(element);
            try {
                var data = domData.context;
                if (element.attr(this._directiveName)) {
                    domData.binding[this._directiveBinding] = {
                        pattern: element.attr(this._directiveName)
                    };
                    element.removeAttr(this._directiveName);
                }
                if (domData.binding[this._directiveBinding]) {
                    if (this._directiveName === 'p-for') {
                        var parentElement = element.parent();
                        if (!domData.parent) {
                            domData.parent = parentElement;
                        }
                    }
                    var expression = domData.binding[this._directiveBinding].pattern.replace(/\s/g, '');
                    var property = this._util.dividePipe(expression).property;
                    var target = this._util.calcu(expression, element, data);
                    if (!domData.pattern) {
                        if (this._directiveName === 'p-for') {
                            var outerHtml = element.prop('outerHTML');
                            outerHtml = outerHtml.replace(/jQuery\d*\="\d*"/, '');
                            domData.pattern = outerHtml;
                        }
                        else {
                            domData.pattern = element.html();
                        }
                    }
                    ;
                    var fullProp = property;
                    this.addChildren(element, target);
                }
                this.next();
            }
            catch (err) {
                this.error(this._directiveName, err.message, domData);
            }
        };
        iteratorBase.generateChild = function (domData, index, value) {
            var alias = domData.alias;
            var htmlText = domData.pattern;
            var newChild = Pandyle.$(htmlText);
            var _alias = Pandyle.$.extend({}, alias, { index: { data: index, property: '@index' } });
            var childrenDomData = Pandyle.getDomData(newChild);
            childrenDomData.context = value;
            childrenDomData.alias = _alias;
            return newChild[0];
        };
        return iteratorBase;
    }(Pandyle.DirectiveBase));
    Pandyle.iteratorBase = iteratorBase;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var PEachDirective = (function (_super) {
        __extends(PEachDirective, _super);
        function PEachDirective() {
            var _this = _super.call(this) || this;
            _this._directiveName = 'p-each';
            _this._directiveBinding = 'Each';
            return _this;
        }
        PEachDirective.prototype.addChildren = function (element, targetArray) {
            var domData = Pandyle.getDomData(element);
            element.children().remove();
            if (domData.children) {
                domData.children.remove();
            }
            var arr = [];
            targetArray.forEach(function (value, index) {
                var newChildren = Pandyle.iteratorBase.generateChild(domData, index, value);
                arr.push(newChildren);
            });
            if (arr.length > 0) {
                element.append(arr);
            }
            domData.children = element.children();
        };
        return PEachDirective;
    }(Pandyle.iteratorBase));
    Pandyle.PEachDirective = PEachDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var PForDirective = (function (_super) {
        __extends(PForDirective, _super);
        function PForDirective() {
            var _this = _super.call(this) || this;
            _this._directiveBinding = "For";
            _this._directiveName = "p-for";
            return _this;
        }
        PForDirective.prototype.addChildren = function (element, targetArray) {
            var domData = Pandyle.getDomData(element);
            element.children().remove();
            if (domData.children) {
                domData.children.remove();
            }
            var div = Pandyle.$('<div />');
            var arr = [];
            targetArray.forEach(function (value, index) {
                var newChildren = Pandyle.iteratorBase.generateChild(domData, index, value);
                arr.push(newChildren);
            });
            div.append(arr);
            var actualChildren = div.children();
            domData.children = actualChildren;
            element.detach();
            var pindex = domData.pIndex;
            var pre = domData.parent.children().filter(function (index, ele) {
                return Pandyle.getDomData(Pandyle.$(ele)).pIndex === (pindex - 1);
            });
            if (pre.length > 0) {
                actualChildren.insertAfter(pre);
            }
            else {
                domData.parent.prepend(actualChildren);
            }
        };
        return PForDirective;
    }(Pandyle.iteratorBase));
    Pandyle.PForDirective = PForDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var PContextDirective = (function (_super) {
        __extends(PContextDirective, _super);
        function PContextDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PContextDirective.prototype.execute = function () {
            var element = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(element);
            var binding = domData.binding;
            try {
                if (element.attr('p-context')) {
                    binding['Context'] = {
                        pattern: element.attr('p-context')
                    };
                    element.removeAttr('p-context');
                }
                if (binding['Context']) {
                    var data = void 0;
                    var expression = binding['Context'].pattern;
                    var divided = this._util.dividePipe(expression);
                    var property = divided.property;
                    var method = divided.method;
                    if (domData.ocontext) {
                        data = domData.ocontext;
                    }
                    else {
                        data = domData.context;
                    }
                    var target = this._util.calcu(property, element, data);
                    if (method) {
                        target = this._util.convert(method, Pandyle.$.extend({}, target));
                    }
                    if (!domData.ocontext) {
                        this._util.setAlias(element, target);
                        domData.ocontext = data;
                    }
                    domData.context = target;
                    element.find('*').each(function (index, ele) {
                        Pandyle.getDomData(Pandyle.$(ele)).context = null;
                    });
                }
                this.next();
            }
            catch (err) {
                this.error('p-context', err.message, domData);
            }
        };
        return PContextDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.PContextDirective = PContextDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var POnDirective = (function (_super) {
        __extends(POnDirective, _super);
        function POnDirective() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        POnDirective.prototype.execute = function () {
            var _this = this;
            var ele = Pandyle.$(this._context.element);
            var domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-on')) {
                    var binds = Pandyle.$(ele).attr('p-on').split('^');
                    binds.forEach(function (bindInfo, index) {
                        var array = bindInfo.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
                        var event = array[1];
                        var handler = array[2].replace(/\s*$/, '');
                        ele.on(event, function () {
                            _this._util.calcu(handler, ele, domData.context);
                        });
                    });
                    ele.removeAttr('p-on');
                }
                this.next();
            }
            catch (err) {
                this.error('p-on', err.message, domData);
            }
        };
        return POnDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.POnDirective = POnDirective;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var PipeLine = (function () {
        function PipeLine(util) {
            this._util = util;
        }
        ;
        PipeLine.prototype.add = function (directive) {
            if (!this._firstDirective) {
                this._firstDirective = this._lastDirective = directive;
            }
            else {
                this._lastDirective.append(directive);
                this._lastDirective = directive;
            }
            return this;
        };
        PipeLine.prototype.start = function (context) {
            this._firstDirective.init(context, this._util);
            this._firstDirective.execute();
        };
        PipeLine.createPipeLine = function (util) {
            var pipe = new PipeLine(util);
            pipe.add(new Pandyle.PContextDirective())
                .add(new Pandyle.PIfDirective())
                .add(new Pandyle.PForDirective())
                .add(new Pandyle.PEachDirective())
                .add(new Pandyle.PBindDirective())
                .add(new Pandyle.POnDirective())
                .add(new Pandyle.pComDirective())
                .add(new Pandyle.pTextDirective());
            return pipe;
        };
        return PipeLine;
    }());
    Pandyle.PipeLine = PipeLine;
})(Pandyle || (Pandyle = {}));
if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        var res = new Array();
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i];
                if (fun.call(thisp, val, i, this))
                    res.push(val);
            }
        }
        return res;
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fun) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function (fun, thisp) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }
        return res;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function (callbackfn, initialValue) {
        'use strict';
        if (null === this || 'undefined' === typeof this) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if ('function' !== typeof callbackfn) {
            throw new TypeError(callbackfn + ' is not a function');
        }
        var index, value, length = this.length >>> 0, isValueSet = false;
        if (1 < arguments.length) {
            value = initialValue;
            isValueSet = true;
        }
        for (index = 0; length > index; ++index) {
            if (this.hasOwnProperty(index)) {
                if (isValueSet) {
                    value = callbackfn(value, this[index], index, this);
                }
                else {
                    value = this[index];
                    isValueSet = true;
                }
            }
        }
        if (!isValueSet) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        return value;
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (el) {
        for (var i = 0, n = this.length; i < n; i++) {
            if (this[i] === el) {
                return i;
            }
        }
        return -1;
    };
}
var Pandyle;
(function (Pandyle) {
    var Renderer = (function () {
        function Renderer(vm) {
            this._util = Pandyle.Util.CreateUtil(vm);
            this._pipeline = Pandyle.PipeLine.createPipeLine(this._util);
        }
        ;
        Renderer.prototype.renderSingle = function (ele, data, alias) {
            var element = Pandyle.$(ele);
            var domData = Pandyle.getDomData(element);
            if (!domData.context) {
                domData.context = data;
            }
            if (!domData.binding) {
                domData.binding = {};
            }
            if (alias && !Pandyle.$.isEmptyObject(alias)) {
                if (domData.alias) {
                    var index = domData.alias.index;
                    domData.alias = Pandyle.$.extend(domData.alias, alias);
                    index ? domData.alias.index = index : '';
                }
                else {
                    domData.alias = alias;
                }
            }
            data = domData.context;
            this._util.setAlias(element, data);
            this.renderPipe(ele);
            data = domData.context;
            this.renderChild(ele, data);
            if (domData.afterRender) {
                domData.afterRender();
            }
        };
        Renderer.prototype.renderChild = function (ele, data) {
            var $this = this;
            var element = Pandyle.$(ele);
            var domData = Pandyle.getDomData(element);
            if (!domData.children) {
                domData.children = element.children();
            }
            var children = domData.children;
            if (children.length > 0) {
                var alias_1 = domData.alias;
                children.each(function (index, item) {
                    var child = Pandyle.$(item);
                    var childDomData = Pandyle.getDomData(child);
                    if (!childDomData.context) {
                        childDomData.context = data;
                    }
                    childDomData.pIndex = index;
                    $this.renderSingle(child[0], data, Pandyle.$.extend({}, alias_1));
                });
            }
        };
        Renderer.prototype.renderPipe = function (ele) {
            var context = {
                element: ele
            };
            this._pipeline.start(context);
        };
        return Renderer;
    }());
    Pandyle.Renderer = Renderer;
})(Pandyle || (Pandyle = {}));
//# sourceMappingURL=pandyle.js.map