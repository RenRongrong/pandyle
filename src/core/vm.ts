/// <reference path="statics.ts" />
/// <reference path="component.ts" />

namespace Pandyle {
    export class VM<T> {
        protected _data: T;
        private _relations: relation[];
        private _root: JQuery<HTMLElement>;
        private _methods: object;
        private _filters: object;
        private _converters: object;
        private _variables: object;
        private _defaultAlias: object;

        constructor(element: JQuery<HTMLElement>, data: T, autoRun: boolean = true) {
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
            }
            if (autoRun) {
                this.run();
            }
        }

        public set(newData: any) {
            for (let key in newData) {
                let properties = key.split(/[\[\]\.]/).filter(s => s != '');
                let lastProperty = properties.pop();
                let target = this._data;
                if (properties.length > 0) {
                    target = properties.reduce((obj, current) => {
                        return obj[current];
                    }, this._data);
                }
                target[lastProperty] = newData[key];
                if ($.isArray(target[lastProperty])) {
                    for (let i = this._relations.length - 1; i >= 0; i--) {
                        if (this.isChild(key, this._relations[i].property)) {
                            this._relations.splice(i, 1);
                        }
                    }
                }
                let relation = this._relations.filter(value => this.isSelfOrChild(key, value.property));
                if (relation.length > 0) {
                    relation[0].elements.forEach(ele => {
                        this.render(ele);
                    })
                }
            }
        }

        public get(param?: any) {
            if (!param) {
                return $.extend({}, this._data);
            }
            switch ($.type(param)) {
                case 'array':
                    return param.map(value => this.get(value));
                case 'string':
                    return this.getValue(this._root, param, this._data);
                case 'object':
                    let result = {};
                    for (let key in param) {
                        result[key] = this.getValue(this._root, param[key], this._data);
                    }
                    return result;
                default:
                    return null;
            }
        }

        public run() {
            this.render(this._root, this._data, '', this._defaultAlias);
        }

        public render(element: JQuery<HTMLElement>, data?: any, parentProperty?: string, alias?: any) {
            element.each((index, ele) => {
                this.renderSingle(ele, data, parentProperty, $.extend({}, alias));
            })
        }

        private renderSingle(ele: HTMLElement, data: any, parentProperty: string, alias?: any) {
            let element = $(ele);
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
            if (element.attr('p-com')) {
                loadComponent(ele);
            }
            if (element.attr('p-context')) {
                this.renderContext(ele, parentProperty);
            } else if (element.attr('p-each')) {
                this.setAlias(element, parentProperty, data);
                this.renderEach(element, data, parentProperty);
            } else if (element.children().length > 0) {
                this.setAlias(element, parentProperty, data);
                this.renderChild(ele, data, parentProperty);
            } else {
                this.setAlias(element, parentProperty, data);
                this.renderText(element, parentProperty);
            }

        }

        private bindAttr(ele: HTMLElement, parentProperty) {
            if ($(ele).attr('p-bind')) {
                let binds = $(ele).attr('p-bind').split('^');
                binds.forEach((bindInfo, index) => {
                    let array = bindInfo.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
                    let attr = array[1];
                    let value = array[2].replace(/\s*$/, '');
                    $(ele).data('binding')[attr] = {
                        pattern: value,
                        related: false
                    }
                });
                $(ele).removeAttr('p-bind');
            }
            let bindings = $(ele).data('binding');
            let data = $(ele).data('context');
            for (let a in bindings) {
                if (a !== 'text' && a !== 'if') {
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a].pattern, data, parentProperty));
                }
            }
        }

        private bindIf(ele: HTMLElement, parentProperty) {
            if ($(ele).attr('p-if')) {
                $(ele).data('binding')['If'] = {
                    pattern: $(ele).attr('p-if'),
                    related: false
                };
                $(ele).removeAttr('p-if');
            }
            if ($(ele).data('binding')['If']) {
                let expression: string = $(ele).data('binding')['If'].pattern;
                let data = $(ele).data('context');
                let convertedExpression = this.convertFromPattern($(ele), 'If', expression, data, parentProperty);
                let judge = new Function('return ' + convertedExpression);
                if (judge()) {
                    $(ele).show();
                } else {
                    $(ele).hide();
                }
            }
        }

        private renderContext(ele: HTMLElement, parentProperty: string) {
            let element = $(ele);
            if (element.attr('p-context')) {
                let data = element.data('context');
                let expression = element.attr('p-context');
                let divided = this.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let target: any = this.calcu(property, element, data);
                if (method) {
                    target = this.convert(method, $.extend({}, target));
                }
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }
                this.setAlias(element, fullProp, target);
                this.setRelation(property, $(ele), parentProperty);
                this.renderChild(ele, target, fullProp);
            }
        }

        private renderChild(ele: HTMLElement, data: any, parentProperty: string) {
            let $this = this;
            let element = $(ele);
            if (element.children().length > 0) {
                let alias = element.data('alias');
                element.children().each((index, item) => {
                    let child = $(item);
                    child.data('context', data);
                    $this.renderSingle(child[0], data, parentProperty, $.extend({}, alias));
                })
            }
        }

        private renderEach(element: JQuery<HTMLElement>, data: any, parentProperty) {
            let $this = this;
            if (element.attr('p-each')) {
                let expression = element.attr('p-each').replace(/\s/g, '');
                let divided = this.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let target: any[] = this.calcu(property, element, data);
                if (method) {
                    target = this.filter(method, target);
                }
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this.setRelation(property, element, parentProperty);
                };
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                };
                let alias = element.data('alias');
                let htmlText = element.data('pattern');
                let children = $('<div />').html(htmlText).children();
                element.children().remove();

                target.forEach((value, index) => {
                    let newChildren = children.clone(true, true);
                    element.append(newChildren);
                    $this.render(newChildren, value, fullProp.concat('[', index.toString(), ']'), $.extend({index: {data: index, property: '@index'}}, alias));
                })
            }
        }

        private renderText(element: JQuery<HTMLElement>, parentProperty) {
            let data = element.data('context');
            let text = element.text();
            if (element.data('binding').text) {
                text = element.data('binding').text.pattern;
            }
            let result = this.convertFromPattern(element, 'text', text, data, parentProperty);
            element.html(result);
        }

        private convertFromPattern(element: JQuery<HTMLElement>, prop: string, pattern: string, data: object, parentProperty) {
            let reg = /{{\s*([\w\.\[\]\(\)\,\$@\{\}\d\+\-\*\/\s]*)\s*}}/g;
            let related = false;
            if (reg.test(pattern)) {
                if (!element.data('binding')[prop]) {
                    element.data('binding')[prop] = {
                        pattern: pattern,
                        related: false
                    }
                }
                related = element.data('binding')[prop].related;
            }
            let result = pattern.replace(reg, ($0, $1) => {
                if (!related) {
                    this.setRelation($1, element, parentProperty);
                    element.data('binding')[prop].related = true;
                }
                return this.getValue(element, $1, data);
            });
            return result;
        }

        private setRelation(property: string, element: JQuery<HTMLElement>, parentProperty) {
            if (/^@.*/.test(property)) {
                property = property.replace(/@(\w+)?/, ($0, $1) => {
                    return this.getAliasProperty(element, $1);
                })
            } else if (parentProperty != '') {
                property = parentProperty + '.' + property;
            }
            if (/^\./.test(property)) {
                property = property.substr(1);
            }
            let relation = this._relations.filter(value => value.property === property);
            if (relation.length == 0) {
                this._relations.push({
                    property: property,
                    elements: [element]
                });
            } else {
                if (relation[0].elements.indexOf(element) < 0) {
                    relation[0].elements.push(element);
                }
            }
        }

        private isSelfOrChild(property: string, subProperty: string) {
            property = property.replace(/[\[\]\(\)\.]/g, $0 => {
                return '\\' + $0;
            })
            let reg = new RegExp('^' + property + '$' + '|' + '^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        }

        private isChild(property: string, subProperty: string) {
            let reg = new RegExp('^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        }

        private getValue(element: JQuery<HTMLElement>, property: string, data: any) {
            let result = this.calcu(property, element, data);
            let type = $.type(result);
            if (type === 'string' || type === 'number' || type === 'boolean') {
                return result;
            } else {
                return $.extend(this.toDefault(type), result);
            }
        }

        private calcu(property: string, element: JQuery<HTMLElement>, data: any) {
            let nodes = property.match(/[@\w]+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            if (!nodes) {
                return '';
            }
            let result = nodes.reduce((obj, current) => {
                let arr = /^([@\w]+)([\(|\[].*)*/.exec(current);
                let property = arr[1];
                let tempData;
                if (/^@.*/.test(property)) {
                    tempData = this.getAliasData(element, property.substr(1));
                }
                else {
                    tempData = obj[property];
                }
                let symbols = arr[2];
                if (symbols) {
                    let arr = symbols.match(/\[\d+\]|\(.*\)/g);
                    return arr.reduce((obj2, current2) => {
                        if (/\[\d+\]/.test(current2)) {
                            let arrayIndex = parseInt(current2.replace(/\[(\d+)\]/, '$1'));
                            return obj2[arrayIndex];
                        }
                        else if (/\(.*\)/.test(current2)) {
                            let params = current2.replace(/\((.*)\)/, '$1').replace(/\s/, '').split(',');
                            let computedParams = params.map(p => {
                                if (/^[A-Za-z_\$\@].*$/.test(p)) {
                                    return this.calcu(p, element, data);
                                }
                                else {
                                    return (new Function('return ' + p))();
                                }
                            });
                            let func: Function = obj2 || this.getMethod(property) || getMethod(property) || window[property];
                            return func.apply(this, computedParams);
                        }
                    }, tempData);
                }
                else {
                    return tempData;
                }
            }, data);
            return result;
        }

        private toDefault(type: string) {
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
        }

        private setAlias(element: JQuery<HTMLElement>, property: string, data?: any) {
            let targetData = data || element.data('context');
            element.data('alias').self = {
                data: targetData,
                property: property
            };
            if (element.attr('p-as')) {
                let alias = element.attr('p-as');
                element.data('alias')[alias] = {
                    data: targetData,
                    property: property
                }
            }
        }

        private getAliasData(element: JQuery<HTMLElement>, alias: string) {
            let data = element.data('alias');
            return data[alias].data;
        }

        private getAliasProperty(element: JQuery<HTMLElement>, alias: string) {
            let data = element.data('alias');
            return data[alias].property;
        }

        private getMethod(name: string): Function {
            return this._methods[name];
        }

        private dividePipe(expression: string) {
            let array = expression.split('|');
            let property = array[0].replace(/\s/g, '');
            let method = array[1] ? array[1].replace(/\s/g, '') : null;
            return {
                property: property,
                method: method
            }
        }

        private convert(method: string, data: any) {
            if (/^{.*}$/.test(method)) {
                let pairs = method.replace(/{|}/g, '').split(',');
                return pairs.reduce((pre, current) => {
                    let pair = current.split(':');
                    if (/^[a-zA-z$_]+/.test(pair[1])) {
                        pre[pair[0]] = pair[1].split('.').reduce((predata, property) => {
                            return predata[property];
                        }, data);
                    } else {
                        pre[pair[0]] = new Function('return ' + pair[1])();
                    }
                    return pre;
                }, {})
            } else {
                if (!hasSuffix(method, 'Converter')) {
                    method += 'Converter';
                }
                return this._converters[method](data);
            }
        }

        private filter(method: string, data: any[]) {
            if (!hasSuffix(method, 'Filter')) {
                method += 'Filter';
            }
            return this._filters[method](data);
        }

        public register(name: string, value: any) {
            if ($.isFunction(value)) {
                if (hasSuffix(name, 'Filter')) {
                    this._filters[name] = value;
                } else if (hasSuffix(name, 'Converter')) {
                    this._converters[name] = value;
                } else {
                    this._methods[name] = value;
                }
            } else {
                this._variables[name] = value;
            }
        }
    }
}