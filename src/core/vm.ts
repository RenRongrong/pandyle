/// <reference path="statics.ts" />
/// <reference path="component.ts" />
/// <reference path="util.ts" />
/// <reference path="relationCollection.ts" />

namespace Pandyle {
    export class VM<T> {
        protected _data: T;
        private _root: JQuery<HTMLElement>;
        private _methods: object;
        private _filters: object;
        public _converters: object;
        private _variables: object;
        private _defaultAlias: object;

        public _relationCollection: IRelationCollection;
        private _util: Util<T>;

        private static _uid = 1;

        constructor(element: JQuery<HTMLElement>, data: T, autoRun: boolean = true) {
            this._data = $.extend({}, data);
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
            }
            
            this._util = Util.CreateUtil(this);
            this._relationCollection = relationCollection.CreateRelationCollection(this._util);

            if (autoRun) {
                this.run();
            }
        }

        public set(newData:string, value:any);
        public set(newData: object);
        public set(newData: any, value?:any) {
            let _newData = {};
            if(arguments.length === 2){
                _newData[newData] = value;
            }else{
                _newData = newData;
            }
            for (let key in _newData) {
                let properties = key.split(/[\[\]\.]/).filter(s => s != '');
                let lastProperty = properties.pop();
                let target = this._data;
                if (properties.length > 0) {
                    target = properties.reduce((obj, current) => {
                        return obj[current];
                    }, this._data);
                }
                target[lastProperty] = _newData[key];
                if ($.isArray(target[lastProperty])) {
                    this._relationCollection.removeChildren(key);
                }
                let relation = this._relationCollection.findSelfOrChild(key);
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
                    return this._util.getValue(this._root, param, this._data);
                case 'object':
                    let result = {};
                    for (let key in param) {
                        result[key] = this._util.getValue(this._root, param[key], this._data);
                    }
                    return result;
                default:
                    return null;
            }
        }

        public run() {
            this.render(this._root, this._data, '', this._defaultAlias);
        }

        /**
         * 渲染指定的元素
         * @param element 渲染对象
         * @param data 数据上下文
         * @param parentProperty 父级字段的名称
         * @param alias 别名对象
         */
        public render(element: JQuery<HTMLElement>, data?: any, parentProperty?: string, alias?: any) {
            element.each((index, ele) => {
                this.renderSingle(ele, data, parentProperty, $.extend({}, alias));
            })
        }

        /**
         * 渲染单个元素
         * @param ele 要渲染的dom元素
         * @param data 数据上下文
         * @param parentProperty 父级字段的名称
         * @param alias 别名对象
         */
        private renderSingle(ele: HTMLElement, data: any, parentProperty: string, alias?: any) {
            let element = $(ele);
            if (!element.data('context')) {
                element.data('context', data);
            }
            if (!element.data('binding')) {
                element.data('binding', {});
            }
            if (alias && !$.isEmptyObject(alias)) {
                element.data('alias', alias);
            }
            data = element.data('context');
            this._util.setAlias(element, parentProperty, data);
            if(!this.bindIf(ele, parentProperty)){
                return;
            }
            if (element.attr('p-for')) {
                // this.setAlias(element, parentProperty, data);
                this.renderFor(element, data, parentProperty);
            } else {
                this.bindAttr(ele, parentProperty);
                
                if (element.attr('p-com')) {
                    loadComponent(ele);
                }
                if (element.attr('p-context')) {
                    this.renderContext(ele, parentProperty);
                } else if (element.attr('p-each')) {
                    // this.setAlias(element, parentProperty, data);
                    this.renderEach(element, data, parentProperty);
                } else if (element.children().length > 0) {
                    // this.setAlias(element, parentProperty, data);
                    this.renderChild(ele, data, parentProperty);
                } else {
                    // this.setAlias(element, parentProperty, data);
                    this.renderText(element, parentProperty);
                }
            }

        }

        /**
         * 通过p-bind指令绑定元素的属性
         * @param ele 目标元素
         * @param parentProperty 父级字段的名称
         */
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

        /**
         * 通过p-if指令控制元素的显示与否
         * @param ele 目标元素
         * @param parentProperty 父级字段的名称
         */
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
                    return true;
                } else {
                    $(ele).hide();
                    return false;
                }
            }else{
                return true;
            }
        }

        /**
         * 通过p-context修改元素的数据上下文
         * @param ele 目标元素
         * @param parentProperty 父级字段的名称
         */
        private renderContext(ele: HTMLElement, parentProperty: string) {
            let element = $(ele);
            if (element.attr('p-context')) {
                let data = element.data('context');
                let expression = element.attr('p-context');
                let divided = this._util.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let target: any = this._util.calcu(property, element, data);
                if (method) {
                    target = this._util.convert(method, $.extend({}, target));
                }
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }
                this._util.setAlias(element, fullProp, target);
                this._relationCollection.setRelation(property, $(ele), parentProperty);
                this.renderChild(ele, target, fullProp);
            }
        }

        /**
         * 渲染目标元素的子元素
         * @param ele 目标元素
         * @param data 数据上下文
         * @param parentProperty 父级字段的名称
         */
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

        /**
         * 
         * @param element 渲染对象
         * @param data 数据上下文
         * @param parentProperty 父级字段的名称
         */
        private renderEach(element: JQuery<HTMLElement>, data: any, parentProperty) {
            let $this = this;
            if (element.attr('p-each')) {
                let expression = element.attr('p-each').replace(/\s/g, '');
                let divided = this._util.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let target: any[] = this._util.calcu(property, element, data);
                if (method) {
                    target = this.filter(method, target);
                }
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this._relationCollection.setRelation(property, element, parentProperty);
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
                    $this.render(newChildren, value, fullProp.concat('[', index.toString(), ']'), $.extend(alias, { index: { data: index, property: '@index' } }));
                })
            }
        }

        private renderFor(element: JQuery<HTMLElement>, data: any, parentProperty) {
            let $this = this;
            if (element.attr('p-for')) {
                if (!element.data('uid')) {
                    element.data('uid', VM._uid++);
                }
                let expression = element.attr('p-for').replace(/\s/g, '');
                let divided = this._util.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let target: any[] = this._util.calcu(property, element, data);
                if (method) {
                    target = this.filter(method, target);
                }
                if (!element.data('pattern')) {
                    element.data('pattern', element.prop('outerHTML'));
                    // this.setRelation(property, element, parentProperty);
                };
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                };
                let alias = element.data('alias');
                let htmlText = element.data('pattern');
                let siblingText = htmlText.replace(/p-for=((".*?")|('.*?'))/g, '');
                let siblings = $(siblingText);
                element.siblings('[uid=' + element.data('uid') + ']').remove();

                let afterElement = function (ele: JQuery<HTMLElement>, target: any[], index: number) {
                    if (target.length === 0) {
                        return;
                    }
                    let newSibling = siblings.clone(true, true);
                    ele.after(newSibling);
                    $this.render(newSibling, target.shift(), fullProp.concat('[', index.toString(), ']'), $.extend(alias, { index: { data: index, property: '@index' } }));
                    if (index === 0) {
                        newSibling.data('uid', element.data('uid'));
                        newSibling.data('pattern', htmlText);
                        newSibling.attr('p-for', expression);
                        newSibling.data('context', data);
                        $this._relationCollection.setRelation(property, newSibling, parentProperty);
                    } else {
                        newSibling.attr('uid', element.data('uid'));
                    }
                    afterElement(newSibling, target, ++index);
                }

                afterElement(element, target, 0);
                element.remove();
            }
        }

        /**
         * 渲染文本插值
         * @param element 渲染对象
         * @param parentProperty 父级字段的名称
         */
        private renderText(element: JQuery<HTMLElement>, parentProperty) {
            let data = element.data('context');
            let text = element.text();
            if (element.data('binding').text) {
                text = element.data('binding').text.pattern;
            }
            let result = this.convertFromPattern(element, 'text', text, data, parentProperty);
            element.html(result);
        }

        
        public getMethod(name: string): Function {
            return this._methods[name];
        }

        public filter(method: string, data: any[]) {
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