'use strict';

function Template(obj) {
    obj = obj || {};
    this.data = obj.data || {};
    this.template = obj.template || '';
    this.callback = obj.callback;
    this.dataEmptyHandler = false || obj.dataEmptyHandler;
    if (obj.handlers) {
        this.addHandlersMethod(obj.handlers);
    }
}

Template.isType = (function() {
    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]"
        }
    }
    return {
        isObject: isType("Object"),
        isString: isType("String"),
        isArray: Array.isArray || isType("Array"),
        isFunction: isType("Function"),
        isUndefined: isType("Undefined")
    }
})();

Template.addHandlersMethod = function(obj) {
    for (var name in obj) {
        Template.prototype.handlers[name] = obj[name];
    }
};

Template.prototype = {
    constructor: Template,
    init: function(template) {
        template = template || this.template;
        var reg = /(?!^)(?=<\/?exp)/g;
        //去除换行符，并切割语法标签前的内容
        var tempArr = template.replace(/\s*\n\s*/g, '').split(reg);
        var newArr = [];
        var reg2 = /^(<\/?exp(?:\s+\w+\s*=\s*(?:(?:[^>](?!\s))+|['"][^'"]+['"]))?>)(.*)$/;
        //切割语法标签后的内容
        //抽取模板业务逻辑
        for (var i = 0; i < tempArr.length; i++) {
            var current = tempArr[i];
            if (reg2.test(current)) {
                current.replace(reg2, function($0, $1, $2) {
                    newArr.push($1);
                    $2 && newArr.push($2);
                })
            } else {
                newArr.push(current);
            }
        }

        //构建逻辑树
        function init(arr) {
            var stratIndex;
            for (var i = 0; i < arr.length; i++) {
                if (Template.isType.isArray(arr[i])) continue;
                if (/^<exp/.test(arr[i])) {
                    stratIndex = i;
                } else if (/^<\/exp/.test(arr[i])) {
                    arr.splice(stratIndex, 0, arr.splice(stratIndex, i - stratIndex + 1));
                    init(arr);
                    break;
                }
            }
        }
        init(newArr);
        var result = this._computed(newArr, this.data);
        if (this.callback) {
            this.callback(result);
        }
        return result;
    },
    _computed: function(ruleTree, data) {
        var _this = this;

        function concat(arr) {

            var result = '';
            if (Template.isType.isArray(arr)) {
                var firstChild = arr[0];

                if (Template.isType.isString(firstChild) && /^<exp/.test(firstChild)) {
                    firstChild.replace(/^<exp\s+|>$|['"]/g, '').replace(/^(\w+)(?:\s*=\s*)?(.+)?$/, function($0, $1, $2) {
                        arr.pop();
                        arr.shift();
                        var reg = /^\s+|\s+$/g;
                        $1 = $1.replace(reg, '');
                        if ($1 == 'component') {
                            result += _this._component(data);
                            return;
                        }
                        $2 = $2.replace(reg, '');
                        switch ($1) {
                            case 'for':
                                result += _this._for(arr, data, $2);
                                break;
                            case 'if':
                                result += _this._if(arr, data, $2);
                                break;
                            case 'log':
                                result += _this._log(arr, data, $2);
                                break;
                            case 'sort':
                                result += _this._sort(arr, data, $2);
                                break;
                        }
                    });
                } else {
                    for (var i = 0; i < arr.length; i++) {
                        if (Template.isType.isArray(arr[i])) {
                            result += concat(arr[i]);
                        } else {
                            result += _this._replace(arr[i], data)
                        }
                    }
                }
                return result;
            }
            return _this._replace(arr, data);
        }
        return concat(ruleTree);
    },
    _component: function(data) {
        data = data.$$curentObject;
        var template = new Template({
            template: textModules[data.componentName],
            data: data
        });
        return template.init();
    },
    _replace: function(str, data) {
        var _this = this;
        return str.replace(/\{\{([^}]+)\}\}/g, function($0, $1) {
            return _this._calculator(_this._createExpressionTree($1), data);
        });
    },
    _getValue: function(expression, data) {
        var reg = /^!{0,2}@(\w+(?:\.\w+)*)(.*)$/;
        var value;
        if (reg.test(expression)) {
            var _this = this;
            expression.replace(reg, function($0, $1, $2) {
                var isToBoolen = /^!+/.exec($0);
                var aKey = $1.match(/[^.]+/g);

                function getValue(data) {
                    switch (data) {
                        case undefined:
                        case null:
                            return _this.dataEmptyHandler ? '' : data;
                    }
                    if (aKey.length) {
                        if (data[aKey[0]] === undefined) {
                            if (data.$$parentObject === undefined) {
                                if (aKey.length === 1) {
                                    return getValue(undefined);
                                }
                                throw new Error('表达式：' + $0 + '中，' + aKey[0] + '未定义');
                            }
                            return getValue(data.$$parentObject);
                        }
                        return getValue(data[aKey.shift()]);
                    }
                    return data;
                }
                switch ($1) {
                    case 'true':
                        value = true;
                        break;
                    case 'false':
                        value = false;
                        break;
                    case 'undefined':
                        value = undefined;
                        break;
                    case 'null':
                        value = null;
                        break;
                    default:
                        value = getValue(data);
                }
                if (Template.isType.isFunction(value)) {
                    try {
                        value = value();
                    } catch (e) {
                        throw new Error(e);
                    }
                }
                if (isToBoolen) {
                    value = isToBoolen[0].length === 1 ? !value : !! value;
                }
                if ($2) {
                    value = _this._valueHandler(value, $2.replace(/^\s*\|\s*/, ''), data);
                }
            })
            return value;
        }
        value = Number(expression);
        return isNaN(value) ? expression : value;
    },
    _valueHandler: function(value, expression, data) {
        if (!expression) return value;
        var arr = expression.split(/\|/);
        var _this = this;

        function getValue(value) {
            if (!arr.length) return value;
            var aCurrentHandler = [];
            arr.shift().replace(/(^[^:]+)(.*$)/, function($0, $1, $2) {
                aCurrentHandler.push($1.replace(/^\s+|\s+$/g, ''));
                $2 && aCurrentHandler.push($2.substring(1).replace(/^\s+|\s+$/g, ''));
            });
            var params = [];
            if (aCurrentHandler[1]) {
                params = aCurrentHandler[1].split(/\s*,\s*/);
                for (var i = 0; i < params.length; i++) {
                    if (/^@\w+/.test(params[i])) {
                        params[i] = _this._getValue(params[i], data);
                    }
                }
            }
            params.unshift(value);
            var handlerFn = _this.handlers[aCurrentHandler[0]];
            if (handlerFn && Template.isType.isFunction(handlerFn)) {
                return getValue(handlerFn.apply({}, params));
            }
            throw new Error(aCurrentHandler[0] + '不是一个函数，或未定义');
        }
        return getValue(value);
    },
    _createExpressionTree: function(expression) {


        var arr = expression.replace(/[()]/g, function(str) {
            return str === '(' ? ' ( ' : ' ) ';
        }).replace(/^\s+|\s+$/g, '').split(/\s+(?=\*|\/|%|\+|\-|<=?|>=?|===?|!==?|&&|\|\||\))/);

        var newArr = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (/^(\(|\*|\/|%|\+|\-|<=?|>=?|===?|!==?|&&|\|\|)\s+/.test(item)) {
                item.replace(/(\(|\*|\/|%|\+|\-|<=?|>=?|===?|!==?|&&|\|\|)\s+(.*$)/, function($0, $1, $2) {
                    newArr.push($1);
                    newArr.push($2);
                })
            } else {
                newArr.push(item);
            }
        }
        //构建规则树
        function init(arr) {
            var stratIndex;
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === '(') {
                    stratIndex = i;
                } else if (Template.isType.isString(arr[i]) && /^\)/.test(arr[i])) {
                    var child = arr.splice(stratIndex, i - stratIndex + 1);
                    if (child[0] === '(') {
                        child.shift();
                        var endItem = child.pop();
                        if (/^\)\s+\|\s*/.test(endItem)) {
                            child.push(endItem.replace(/^\)\s+\|\s*/, ''));
                        }
                    }
                    arr.splice(stratIndex, 0, child);
                    init(arr);
                    break;
                }
            }
        }
        init(newArr);
        return newArr;
    },
    _calculator: function(arg, data) {
        if (Template.isType.isArray(arg)) {
            var result;
            var handlerExpressions;
            if (arg.length % 2 === 0) {
                handlerExpressions = arg.pop();
            }
            for (var i = 0; i < arg.length; i += 2) {
                arg[i] = this._calculator(arg[i], data);
            }

            function calculator(operator, prev, next) {
                switch (operator) {
                    case '*':
                        return prev * next;
                    case '/':
                        return prev / next;
                    case '%':
                        return prev % next;
                    case '+':
                        return prev + next;
                    case '-':
                        return prev - next;
                    case '<':
                        return prev < next;
                    case '<=':
                        return prev <= next;
                    case '>':
                        return prev > next;
                    case '>=':
                        return prev >= next;
                    case '==':
                        return prev == next;
                    case '!=':
                        return prev != next;
                    case '===':
                        return prev === next;
                    case '!==':
                        return prev !== next;
                    case '&&':
                        return prev && next;
                    case '||':
                        return prev || next;
                }
            }
            for (var i = 1; i < arg.length; i += 2) {
                switch (arg[i]) {
                    case '*':
                    case '/':
                    case '%':
                        arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                        i -= 2;
                        break;
                }
            }
            for (var i = 1; i < arg.length; i += 2) {
                switch (arg[i]) {
                    case '+':
                    case '-':
                        arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                        i -= 2;
                        break;
                }
            }
            for (var i = 1; i < arg.length; i += 2) {
                switch (arg[i]) {
                    case '<':
                    case '<=':
                    case '>':
                    case '>=':
                        arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                        i -= 2;
                        break;
                }
            }
            for (var i = 1; i < arg.length; i += 2) {
                switch (arg[i]) {
                    case '==':
                    case '!=':
                    case '===':
                    case '!==':
                        arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                        i -= 2;
                        break;
                }
            }
            for (var i = 1; i < arg.length; i += 2) {
                switch (arg[i]) {
                    case '&&':
                        arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                        i -= 2;
                        break;
                    case '||':
                        arg.splice(i - 1, 3, calculator(arg[i], arg[i - 1], arg[i + 1]));
                        i -= 2;
                        break;
                }
            }
            result = arg[0];
            if (handlerExpressions) {
                return this._valueHandler(result, handlerExpressions, data);
            }
            //console.log(result)
            return result;
        } else {
            return this._getValue(arg, data);
        }
    },
    _copy: function(obj) {
        function copy(obj) {
            var newObj;
            if (Template.isType.isArray(obj)) {
                newObj = [];
                for (var i = 0; i < obj.length; i++) {
                    if (Template.isType.isArray(obj[i]) || Template.isType.isObject(obj[i])) {
                        newObj.push(copy(obj[i]))
                    } else {
                        newObj.push(obj[i]);
                    }
                }
            } else if (Template.isType.isObject(obj)) {
                newObj = {};
                for (var i in obj) {
                    if (Template.isType.isArray(obj[i]) || Template.isType.isObject(obj[i])) {
                        newObj[i] = copy(obj[i]);
                    } else {
                        newObj[i] = obj[i];
                    }
                }
            }
            return newObj;
        }
        return copy(obj);
    },
    _recordScope: function(data, obj, valueKey, i) {
        var currentObj = {
            $$parentObject: data,
            $$curentObject: obj
        };
        switch (valueKey.length) {
            case 1:
                currentObj[valueKey[0]] = obj;
                break;
            case 2:
                currentObj[valueKey[0]] = obj;
                currentObj[valueKey[1]] = i;
        }
        return currentObj;
    },
    _for: function(ruleTree, data, expression) {
        expression = expression.split(/\s+/);
        var lastExperssion = expression.pop();
        var obj = this._getValue(lastExperssion, data);
        expression.pop();
        var result = '';

        if (Template.isType.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                result += this._computed(this._copy(ruleTree), this._recordScope(data, obj[i], expression, i));
            }
            return result;
        } else if (Template.isType.isString(obj)) {
            for (var i = 0; i < obj.length; i++) {
                result += this._computed(this._copy(ruleTree), this._recordScope(data, obj.charAt(i), expression, i));
            }
            return result;
        } else if (Template.isType.isObject(obj)) {
            for (var i in obj) {
                result += this._computed(this._copy(ruleTree), this._recordScope(data, obj[i], expression, i));
            }
            return result;
        }
        throw new Error(lastExperssion + ' 不支持循环操作');
    },
    _if: function(ruleTree, data, expression) {
        var expressionTree = this._createExpressionTree(expression);
        if (this._calculator(expressionTree, data)) {
            return this._computed(ruleTree, data);
        }
        return '';
    },
    _sort: function(ruleTree, data, expression) {
        expression = expression.split(/\s+/);
        var newData = this._copy(data);
        var value = this._getValue(expression.pop(), newData);
        var valueKey = expression[0].match(/[^\[\],]+/g);
        if (Template.isType.isArray(value)) {
            value.sort(function(n, m) {
                if (expression.length === 3) {
                    switch (expression[1]) {
                        case '<':
                            return n[expression[2]] - m[expression[2]];
                        case '>':
                            return m[expression[2]] - n[expression[2]];
                    }
                } else {
                    switch (expression[1]) {
                        case '<':
                            return n - m;
                        case '>':
                            return m - n;
                    }
                }
            });
        } else if (Template.isType.isString(value)) {
            value = value.split('').sort();
            switch (expression[1]) {
                case '<':
                    return value.join('');
                case '>':
                    return value.reverse().join('');
            }
        }
        return this._computed(ruleTree, this._recordScope(data, value, valueKey));
    },
    _log: function(ruleTree, data, expression) {
        var oldRuleTree = this._copy(ruleTree);
        ruleTree.pop();
        var expressionTree = this._createExpressionTree(expression);
        var logData = {
            ruleTree: oldRuleTree,
            data: {}
        };
        logData.data[expressionTree[0].substring(1)] = this._calculator(expressionTree, data);
        console.log(logData);
        return '';
    },
    addHandlersMethod: function(obj) {
        for (var name in obj) {
            Template.prototype.handlers[name] = obj[name];
        }
    },
    handlers: {}
};

Template.addHandlersMethod({
    wrap: function(value, htmlStr) {
        return value ? htmlStr.replace(/@content/g, value) : value;
    },
    dateFormat: function(timeNo, sRequired) {
        sRequired = sRequired || 'yyyy-MM-dd';

        function toDouble(n) {
            return n > 9 ? '' + n : '0' + n;
        }
        var weekArr = ['日', '一', '二', '三', '四', '五', '六'];
        var oDate = new Date();
        oDate.setTime(timeNo);
        var year = oDate.getFullYear();
        var month = toDouble(oDate.getMonth() + 1);
        var day = toDouble(oDate.getDate());
        var week = weekArr[oDate.getDay()];
        var h = toDouble(oDate.getHours());
        var m = toDouble(oDate.getMinutes());
        var s = toDouble(oDate.getSeconds());
        switch (sRequired) {
            case 'yyyy-MM-dd':
                return year + '-' + month + '-' + day;
            case 'yyyy':
                return year;
            case 'MM':
                return month;
            case 'dd':
                return day;
            case 'yyyy-MM':
                return year + '-' + month;
            case 'MM-dd':
                return month + '-' + day;
            case 'hh:mm:ss':
                return h + ':' + m + ':' + s;
            case 'hh:mm':
                return h + ':' + m;
            case 'yyyy-MM-dd hh:mm:ss':
                return year + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
            case 'yyyy-MM-dd hh:mm':
                return year + '-' + month + '-' + day + ' ' + h + ':' + m;
        }
    },
    getLength: function(value) {
        return value.length || '';
    },
    toHtml: function(value) {
        if (Template.isType.isArray(value)) {
            return value.join('');
        }
        return '';
    }
});
