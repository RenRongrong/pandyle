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
        var name = Pandyle.$(ele).attr('p-com');
        name = Pandyle.$.trim(name);
        if (hasComponent(name)) {
            Pandyle.$(ele).html(getComponent(name));
        }
        else {
            var url = '';
            if (/^@.*/.test(name)) {
                url = name;
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
                    insertToDom(res, name);
                }
            });
        }
        function insertToDom(text, name) {
            text = text.replace(/<\s*script\s*>((?:.|\r|\n)*?)<\/script\s*>/g, function ($0, $1) {
                (new Function($1))();
                return '';
            });
            text = text.replace(/<\s*style\s*>((?:.|\r|\n)*?)<\/style\s*>/g, function ($0, $1) {
                var style = '<style>' + $1 + '</style>';
                Pandyle.$('head').append(style);
                return '';
            });
            addComponent({
                name: name,
                html: text
            });
            Pandyle.$(ele).html(text);
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
            return Pandyle.$.extend({}, this._data);
        };
        Inputs.prototype.set = function (data) {
            for (var key in data) {
                this.setData(key, data[key]);
                var elements = this._root.find('[name="' + key + '"]');
                this.updateDom(elements, data[key]);
                elements.trigger('modelChange', data[key]);
            }
        };
        Inputs.prototype.initData = function () {
            var _this = this;
            this._root.find('input,textarea,select').each(function (index, ele) {
                var target = Pandyle.$(ele);
                var tag = target.prop('tagName');
                var name = target.prop('name');
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
            if (Pandyle.$.isEmptyObject(this.getDataByName(name))) {
                this.setData(name, []);
            }
            if (element.prop('checked')) {
                this.getDataByName(name).push(value);
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
            this._root.on('change viewChange', 'input,textarea,select', function (e) {
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
            if (element.prop('checked')) {
                this.getDataByName(name).push(value);
            }
            else {
                var index = this.getDataByName(name).indexOf(value);
                this.getDataByName(name).splice(index, 1);
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
    var RelationCollection = (function () {
        function RelationCollection(util) {
            this._util = util;
            this._relations = [];
        }
        RelationCollection.CreateRelationCollection = function (util) {
            return new RelationCollection(util);
        };
        RelationCollection.prototype.setRelation = function (property, element, parentProperty) {
            var _this = this;
            if (/^@.*/.test(property)) {
                property = property.replace(/@(\w+)?/, function ($0, $1) {
                    return _this._util.getAliasProperty(element, $1);
                });
            }
            else if (parentProperty != '') {
                property = parentProperty + '.' + property;
            }
            if (/^\./.test(property)) {
                property = property.substr(1);
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
        RelationCollection.prototype.findSelfOrChild = function (key) {
            var _this = this;
            return this._relations.filter(function (value) { return _this._util.isSelfOrChild(key, value.property); });
        };
        RelationCollection.prototype.removeChildren = function (key) {
            for (var i = this._relations.length - 1; i >= 0; i--) {
                if (this._util.isChild(key, this._relations[i].property)) {
                    this._relations.splice(i, 1);
                }
            }
        };
        return RelationCollection;
    }());
    Pandyle.RelationCollection = RelationCollection;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var VM = (function () {
        function VM(element, data, autoRun) {
            if (autoRun === void 0) { autoRun = true; }
            this._data = Pandyle.$.extend({}, data);
            this._root = element;
            this._methods = {};
            this._filters = {};
            this._converters = {};
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
            this._relationCollection = Pandyle.RelationCollection.CreateRelationCollection(this._util);
            this._renderer = new Pandyle.Renderer(this);
            if (autoRun) {
                this.run();
            }
        }
        VM.prototype.set = function (newData, value) {
            var _this = this;
            var _newData = {};
            if (arguments.length === 2) {
                _newData[newData] = value;
            }
            else {
                _newData = newData;
            }
            for (var key in _newData) {
                var properties = key.split(/[\[\]\.]/).filter(function (s) { return s != ''; });
                var lastProperty = properties.pop();
                var target = this._data;
                if (properties.length > 0) {
                    target = properties.reduce(function (obj, current) {
                        return obj[current];
                    }, this._data);
                }
                target[lastProperty] = _newData[key];
                if (Pandyle.$.isArray(target[lastProperty])) {
                    this._relationCollection.removeChildren(key);
                }
                var relation = this._relationCollection.findSelfOrChild(key);
                if (relation.length > 0) {
                    relation[0].elements.forEach(function (ele) {
                        _this.render(ele);
                    });
                }
            }
        };
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
        VM.prototype.run = function () {
            this.render(this._root, this._data, '', this._defaultAlias);
        };
        VM.prototype.render = function (element, data, parentProperty, alias) {
            var _this = this;
            element.each(function (index, ele) {
                _this._renderer.renderSingle(ele, data, parentProperty, Pandyle.$.extend({}, alias));
            });
        };
        VM.prototype.bindIf = function (ele, parentProperty) {
            if (Pandyle.$(ele).attr('p-if')) {
                Pandyle.$(ele).data('binding')['If'] = {
                    pattern: Pandyle.$(ele).attr('p-if'),
                    related: false
                };
                Pandyle.$(ele).removeAttr('p-if');
            }
            if (Pandyle.$(ele).data('binding')['If']) {
                var expression = Pandyle.$(ele).data('binding')['If'].pattern;
                var data = Pandyle.$(ele).data('context');
                var convertedExpression = this._util.convertFromPattern(Pandyle.$(ele), 'If', expression, data, parentProperty);
                var judge = new Function('return ' + convertedExpression);
                if (judge()) {
                    Pandyle.$(ele).show();
                    return true;
                }
                else {
                    Pandyle.$(ele).hide();
                    return false;
                }
            }
            else {
                return true;
            }
        };
        VM.prototype.renderContext = function (ele, parentProperty) {
            var element = Pandyle.$(ele);
            if (element.attr('p-context')) {
                var data = element.data('context');
                var expression = element.attr('p-context');
                var divided = this._util.dividePipe(expression);
                var property = divided.property;
                var method = divided.method;
                var target = this._util.calcu(property, element, data);
                if (method) {
                    target = this._util.convert(method, Pandyle.$.extend({}, target));
                }
                var fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }
                this._util.setAlias(element, fullProp, target);
                this._relationCollection.setRelation(property, Pandyle.$(ele), parentProperty);
            }
        };
        VM.prototype.renderEach = function (element, data, parentProperty) {
            var $this = this;
            if (element.attr('p-each')) {
                var expression = element.attr('p-each').replace(/\s/g, '');
                var divided = this._util.dividePipe(expression);
                var property = divided.property;
                var method = divided.method;
                var target = this._util.calcu(property, element, data);
                if (method) {
                    target = this.filter(method, target);
                }
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this._relationCollection.setRelation(property, element, parentProperty);
                }
                ;
                var fullProp_1 = property;
                if (parentProperty !== '') {
                    fullProp_1 = parentProperty + '.' + property;
                }
                ;
                var alias_1 = element.data('alias');
                var htmlText = element.data('pattern');
                var children_1 = Pandyle.$('<div />').html(htmlText).children();
                element.children().remove();
                target.forEach(function (value, index) {
                    var newChildren = children_1.clone(true, true);
                    element.append(newChildren);
                    $this.render(newChildren, value, fullProp_1.concat('[', index.toString(), ']'), Pandyle.$.extend(alias_1, { index: { data: index, property: '@index' } }));
                });
            }
        };
        VM.prototype.renderFor = function (element, data, parentProperty) {
            var $this = this;
            if (element.attr('p-for')) {
                if (!element.data('uid')) {
                    element.data('uid', VM._uid++);
                }
                var expression_1 = element.attr('p-for').replace(/\s/g, '');
                var divided = this._util.dividePipe(expression_1);
                var property_1 = divided.property;
                var method = divided.method;
                var target = this._util.calcu(property_1, element, data);
                if (method) {
                    target = this.filter(method, target);
                }
                if (!element.data('pattern')) {
                    element.data('pattern', element.prop('outerHTML'));
                }
                ;
                var fullProp_2 = property_1;
                if (parentProperty !== '') {
                    fullProp_2 = parentProperty + '.' + property_1;
                }
                ;
                var alias_2 = element.data('alias');
                var htmlText_1 = element.data('pattern');
                var siblingText = htmlText_1.replace(/p-for=((".*?")|('.*?'))/g, '');
                var siblings_1 = Pandyle.$(siblingText);
                element.siblings('[uid=' + element.data('uid') + ']').remove();
                var afterElement_1 = function (ele, target, index) {
                    if (target.length === 0) {
                        return;
                    }
                    var newSibling = siblings_1.clone(true, true);
                    ele.after(newSibling);
                    $this.render(newSibling, target.shift(), fullProp_2.concat('[', index.toString(), ']'), Pandyle.$.extend(alias_2, { index: { data: index, property: '@index' } }));
                    if (index === 0) {
                        newSibling.data('uid', element.data('uid'));
                        newSibling.data('pattern', htmlText_1);
                        newSibling.attr('p-for', expression_1);
                        newSibling.data('context', data);
                        $this._relationCollection.setRelation(property_1, newSibling, parentProperty);
                    }
                    else {
                        newSibling.attr('uid', element.data('uid'));
                    }
                    afterElement_1(newSibling, target, ++index);
                };
                afterElement_1(element, target, 0);
                element.remove();
            }
        };
        VM.prototype.getMethod = function (name) {
            return this._methods[name];
        };
        VM.prototype.filter = function (method, data) {
            if (!Pandyle.hasSuffix(method, 'Filter')) {
                method += 'Filter';
            }
            return this._filters[method](data);
        };
        VM.prototype.register = function (name, value) {
            if (Pandyle.$.isFunction(value)) {
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
    VM._uid = 1;
    Pandyle.VM = VM;
})(Pandyle || (Pandyle = {}));
var Pandyle;
(function (Pandyle) {
    var Util = (function () {
        function Util(vm) {
            this._vm = vm;
        }
        Util.CreateUtil = function (vm) {
            var util = new Util(vm);
            return util;
        };
        Util.prototype.getValue = function (element, property, data) {
            var result = this.calcu(property, element, data);
            var type = Pandyle.$.type(result);
            if (type === 'string' || type === 'number' || type === 'boolean' || type === 'null' || type === 'undefined') {
                return result;
            }
            else {
                return Pandyle.$.extend(this.toDefault(type), result);
            }
        };
        Util.prototype.calcu = function (property, element, data) {
            var _this = this;
            var nodes = property.match(/[@\w]+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            if (!nodes) {
                return '';
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
                            var func = obj2 || _this._vm.getMethod(property) || Pandyle.getMethod(property) || window[property];
                            return func.apply(_this, computedParams);
                        }
                    }, tempData);
                }
                else {
                    return tempData;
                }
            }, data);
            return result;
        };
        Util.prototype.convertFromPattern = function (element, prop, pattern, data, parentProperty) {
            var _this = this;
            var reg = /{{\s*([\w\.\[\]\(\)\,\$@\{\}\d\+\-\*\/\s]*?)\s*}}/g;
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
                    _this._vm._relationCollection.setRelation($1, element, parentProperty);
                    element.data('binding')[prop].related = true;
                }
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
        Util.prototype.setAlias = function (element, property, data) {
            var targetData = data || element.data('context');
            element.data('alias').self = {
                data: targetData,
                property: property
            };
            if (element.attr('p-as')) {
                var alias = element.attr('p-as');
                element.data('alias')[alias] = {
                    data: targetData,
                    property: property
                };
            }
        };
        Util.prototype.getAliasData = function (element, alias) {
            var data = element.data('alias');
            return data[alias].data;
        };
        Util.prototype.getAliasProperty = function (element, alias) {
            var data = element.data('alias');
            return data[alias].property;
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
                if (!Pandyle.hasSuffix(method, 'Converter')) {
                    method += 'Converter';
                }
                return this._vm._converters[method](data);
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
            var reg = new RegExp('^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
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
            this._next.init(this._context, this._util);
            this._next.execute();
        };
        DirectiveBase.prototype.deep = function () {
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
            if (ele.attr('p-bind')) {
                var binds = Pandyle.$(ele).attr('p-bind').split('^');
                binds.forEach(function (bindInfo, index) {
                    var array = bindInfo.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
                    var attr = array[1];
                    var value = array[2].replace(/\s*$/, '');
                    ele.data('binding')[attr] = {
                        pattern: value,
                        related: false
                    };
                });
                ele.removeAttr('p-bind');
            }
            var bindings = ele.data('binding');
            var data = ele.data('context');
            for (var a in bindings) {
                if (a !== 'text' && a !== 'if') {
                    Pandyle.$(ele).attr(a, this._util.convertFromPattern(Pandyle.$(ele), a, bindings[a].pattern, data, this._context.parentProperty));
                }
            }
            this.next();
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
            if (ele.attr('p-com')) {
                Pandyle.loadComponent(this._context.element);
            }
            this.next();
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
            if (element.children().length === 0) {
                var data = element.data('context');
                var text = element.text();
                if (element.data('binding').text) {
                    text = element.data('binding').text.pattern;
                }
                var result = this._util.convertFromPattern(element, 'text', text, data, this._context.parentProperty);
                element.html(result);
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
            var _this = this;
            var ele = Pandyle.$(this._context.element);
            var parentProperty = this._context.parentProperty;
            if (ele.attr('p-if')) {
                ele.data('binding')['If'] = {
                    pattern: ele.attr('p-if'),
                    related: false
                };
                ele.removeAttr('p-if');
            }
            if (ele.data('binding')['If']) {
                var parentElement = ele.parent();
                if (!ele.data('parent')) {
                    ele.data('parent', parentElement);
                }
                var expression = ele.data('binding')['If'].pattern;
                var data = ele.data('context');
                var convertedExpression = this._util.convertFromPattern(ele, 'If', expression, data, parentProperty);
                var judge = new Function('return ' + convertedExpression);
                if (judge()) {
                    if (ele.parent().length === 0) {
                        var pindex_1 = ele.data('pindex');
                        var pre = ele.data('parent').children().filter(function () {
                            return Pandyle.$(_this).data('pindex') == (pindex_1 - 1);
                        });
                        if (pre.length > 0) {
                            ele.insertAfter(pre);
                        }
                        else {
                            ele.data('parent').prepend(ele);
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
        };
        return PIfDirective;
    }(Pandyle.DirectiveBase));
    Pandyle.PIfDirective = PIfDirective;
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
            pipe.add(new Pandyle.PIfDirective())
                .add(new Pandyle.PBindDirective())
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
    Array.prototype.map = function (fun) {
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
    Array.prototype.reduce = function (callback, opt_initialValue) {
        'use strict';
        if (null === this || 'undefined' === typeof this) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
        }
        if ('function' !== typeof callback) {
            throw new TypeError(callback + ' is not a function');
        }
        var index, value, length = this.length >>> 0, isValueSet = false;
        if (1 < arguments.length) {
            value = opt_initialValue;
            isValueSet = true;
        }
        for (index = 0; length > index; ++index) {
            if (this.hasOwnProperty(index)) {
                if (isValueSet) {
                    value = callback(value, this[index], index, this);
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
        Renderer.prototype.renderSingle = function (ele, data, parentProperty, alias) {
            var element = Pandyle.$(ele);
            if (!element.data('context')) {
                element.data('context', data);
            }
            if (!element.data('binding')) {
                element.data('binding', {});
            }
            if (alias && !Pandyle.$.isEmptyObject(alias)) {
                element.data('alias', alias);
            }
            data = element.data('context');
            this._util.setAlias(element, parentProperty, data);
            this.renderPipe(ele, parentProperty);
            this.renderChild(ele, data, parentProperty);
        };
        Renderer.prototype.renderChild = function (ele, data, parentProperty) {
            var $this = this;
            var element = Pandyle.$(ele);
            if (element.children().length > 0) {
                var alias_3 = element.data('alias');
                element.children().each(function (index, item) {
                    var child = Pandyle.$(item);
                    child.data('context', data);
                    child.data('pindex', index);
                    $this.renderSingle(child[0], data, parentProperty, Pandyle.$.extend({}, alias_3));
                });
            }
        };
        Renderer.prototype.renderPipe = function (ele, parentProperty) {
            var context = {
                element: ele,
                parentProperty: parentProperty
            };
            this._pipeline.start(context);
        };
        return Renderer;
    }());
    Pandyle.Renderer = Renderer;
})(Pandyle || (Pandyle = {}));
//# sourceMappingURL=pandyle.js.map