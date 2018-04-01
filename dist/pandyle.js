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
        var name = $(ele).attr('p-com');
        name = $.trim(name);
        if (hasComponent(name)) {
            $(ele).html(getComponent(name));
        }
        else {
            var url = '';
            if (/^@.*/.test(name)) {
                url = name;
            }
            else {
                var fullpath = name.split('.');
                var path = Pandyle._config.comPath
                    ? Pandyle._config.comPath.default || '/comments/{name}.html'
                    : '/comments/{name}.html';
                if (fullpath.length > 1) {
                    path = Pandyle._config.comPath[fullpath[0]];
                    url = path.replace(/{.*}/g, fullpath[1]);
                }
                else {
                    url = path.replace(/{.*}/g, name);
                }
            }
            $.ajax({
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
                var style = $('<style></style>').html($1);
                $('head').append(style);
                return '';
            });
            addComponent({
                name: name,
                html: text
            });
            $(ele).html(text);
        }
    }
    Pandyle.loadComponent = loadComponent;
})(Pandyle || (Pandyle = {}));
(function ($) {
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
})(jQuery);
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
            return $.extend({}, this._data);
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
                var target = $(ele);
                var tag = target.prop('tagName');
                var name = target.prop('name');
                _this.initName(name);
                switch (tag) {
                    case 'INPUT':
                        _this.initData_input(target);
                        break;
                    case 'TEXTAREA':
                        _this.initData_normal(target);
                        break;
                    case 'SELECT':
                        _this.initData_select(target);
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
            if ($.isEmptyObject(this.getDataByName(name))) {
                this.setData(name, '');
            }
            if (element.prop('checked')) {
                this.setData(name, value);
            }
        };
        Inputs.prototype.initData_check = function (element) {
            var name = element.prop('name');
            var value = element.val();
            if ($.isEmptyObject(this.getDataByName(name))) {
                this.setData(name, []);
            }
            if (element.prop('checked')) {
                this.getDataByName(name).push(value);
            }
        };
        Inputs.prototype.initData_normal = function (element) {
            var name = element.prop('name');
            var value = element.val();
            this.setData(name, value);
        };
        Inputs.prototype.initData_select = function (element) {
            var name = element.prop('name');
            var value = element.val() || '';
            this.setData(name, value);
        };
        Inputs.prototype.bindChange = function () {
            var _this = this;
            this._root.on('change', 'input,textarea,select', function (e) {
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
            this.setData(name, value);
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
                this.setData(name, value);
            }
        };
        Inputs.prototype.onChange_check = function (element) {
            var name = element.prop('name');
            var value = element.val();
            if (element.prop('checked')) {
                this.getDataByName(name).push(value);
            }
            else {
                var index = this.getDataByName(name).indexOf(value);
                this.getDataByName(name).splice(index, 1);
            }
        };
        Inputs.prototype.onChange_select = function (element) {
            var name = element.prop('name');
            var value = element.val();
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
                var target = $(ele);
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
                var target = $(ele);
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
            this._data = $.extend({}, data);
            this._root = element;
            this._relations = [];
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
            if (autoRun) {
                this.run();
            }
        }
        VM.prototype.set = function (newData) {
            var _this = this;
            var _loop_1 = function (key) {
                var properties = key.split(/[\[\]\.]/).filter(function (s) { return s != ''; });
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
            if (!param) {
                return $.extend({}, this._data);
            }
            switch ($.type(param)) {
                case 'array':
                    return param.map(function (value) { return _this.get(value); });
                case 'string':
                    return this.getValue(this._root, param, this._data);
                case 'object':
                    var result = {};
                    for (var key in param) {
                        result[key] = this.getValue(this._root, param[key], this._data);
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
                _this.renderSingle(ele, data, parentProperty, $.extend({}, alias));
            });
        };
        VM.prototype.renderSingle = function (ele, data, parentProperty, alias) {
            var element = $(ele);
            if (!element.data('context')) {
                element.data('context', data);
            }
            if (!element.data('binding')) {
                element.data('binding', {});
            }
            if (alias) {
                element.data('alias', alias);
            }
            data = element.data('context');
            this.bindAttr(ele, parentProperty);
            this.bindIf(ele, parentProperty);
            if (element[0].tagName === 'C') {
                Pandyle.loadComponent(ele);
            }
            if (element.attr('p-context')) {
                this.renderContext(ele, parentProperty);
            }
            else if (element.attr('p-each')) {
                this.setAlias(element, parentProperty, data);
                this.renderEach(element, data, parentProperty);
            }
            else if (element.children().length > 0) {
                this.setAlias(element, parentProperty, data);
                this.renderChild(ele, data, parentProperty);
            }
            else {
                this.setAlias(element, parentProperty, data);
                this.renderText(element, parentProperty);
            }
        };
        VM.prototype.bindAttr = function (ele, parentProperty) {
            if ($(ele).attr('p-bind')) {
                var binds = $(ele).attr('p-bind').split('^');
                binds.forEach(function (bindInfo, index) {
                    var array = bindInfo.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
                    var attr = array[1];
                    var value = array[2].replace(/\s*$/, '');
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
            var element = $(ele);
            if (element.attr('p-context')) {
                var data = element.data('context');
                var expression = element.attr('p-context');
                var divided = this.dividePipe(expression);
                var property = divided.property;
                var method = divided.method;
                var target = this.calcu(property, element, data);
                if (method) {
                    target = this.convert(method, $.extend({}, target));
                }
                var fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }
                this.setAlias(element, fullProp, target);
                this.setRelation(property, $(ele), parentProperty);
                this.renderChild(ele, target, fullProp);
            }
        };
        VM.prototype.renderChild = function (ele, data, parentProperty) {
            var $this = this;
            var element = $(ele);
            if (element.children().length > 0) {
                var f_1 = function (child, alias) {
                    child.data('context', data);
                    $this.renderSingle(child[0], data, parentProperty, $.extend({}, alias));
                    if (child.next().length > 0) {
                        f_1(child.next(), alias);
                    }
                };
                var first = element.children().first();
                var alias = element.data('alias');
                f_1(first, alias);
            }
        };
        VM.prototype.renderEach = function (element, data, parentProperty) {
            var $this = this;
            if (element.attr('p-each')) {
                var expression = element.attr('p-each').replace(/\s/g, '');
                var divided = this.dividePipe(expression);
                var property = divided.property;
                var method = divided.method;
                var target_1 = this.calcu(property, element, data);
                if (method) {
                    target_1 = this.filter(method, target_1);
                }
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this.setRelation(property, element, parentProperty);
                }
                ;
                var fullProp_1 = property;
                if (parentProperty !== '') {
                    fullProp_1 = parentProperty + '.' + property;
                }
                ;
                var alias_1 = element.data('alias');
                var htmlText = element.data('pattern');
                var children_1 = $('<div />').html(htmlText).children();
                element.children().remove();
                var f_2 = function (i) {
                    if (i >= target_1.length) {
                        return;
                    }
                    var newChildren = children_1.clone(true, true);
                    element.append(newChildren);
                    $this.render(newChildren, target_1[i], fullProp_1.concat('[', i.toString(), ']'), $.extend({ index: { data: i, property: '@index' } }, alias_1));
                    var j = i + 1;
                    f_2(j);
                };
                f_2(0);
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
                return _this.getValue(element, $1, data);
            });
            return result;
        };
        VM.prototype.setRelation = function (property, element, parentProperty) {
            var _this = this;
            if (/^@.*/.test(property)) {
                property = property.replace(/@(\w+)?/, function ($0, $1) {
                    return _this.getAliasProperty(element, $1);
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
        VM.prototype.isSelfOrChild = function (property, subProperty) {
            property = property.replace(/[\[\]\(\)\.]/g, function ($0) {
                return '\\' + $0;
            });
            var reg = new RegExp('^' + property + '$' + '|' + '^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        };
        VM.prototype.isChild = function (property, subProperty) {
            var reg = new RegExp('^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        };
        VM.prototype.getValue = function (element, property, data) {
            var result = this.calcu(property, element, data);
            var type = $.type(result);
            if (type === 'string' || type === 'number' || type === 'boolean') {
                return result;
            }
            else {
                return $.extend(this.toDefault(type), result);
            }
        };
        VM.prototype.calcu = function (property, element, data) {
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
            return result;
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
        VM.prototype.setAlias = function (element, property, data) {
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
        VM.prototype.getAliasData = function (element, alias) {
            var data = element.data('alias');
            return data[alias].data;
        };
        VM.prototype.getAliasProperty = function (element, alias) {
            var data = element.data('alias');
            return data[alias].property;
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
                return this._converters[method](data);
            }
        };
        VM.prototype.filter = function (method, data) {
            if (!Pandyle.hasSuffix(method, 'Filter')) {
                method += 'Filter';
            }
            return this._filters[method](data);
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
//# sourceMappingURL=pandyle.js.map