/// <reference path="statics.ts" />
/// <reference path="component.ts" />
/// <reference path="util.ts" />

namespace Pandyle {
    export class VM<T> {
        protected _data: T;
        private _root: JQuery<HTMLElement>;
        public _methods: object;
        private _variables: object;
        private _defaultAlias: object;

        private _util: Util<T>;
        private _renderer: Renderer<T>

        constructor(element: JQuery<HTMLElement>, data: T, autoRun: boolean = true) {
            this._data = $.extend({}, data);
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
            }

            this._util = Util.CreateUtil(this);
            this._renderer = new Renderer(this);

            if (autoRun) {
                this.run();
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

        /**
         * 
         * @param target 目标
         * @param value 要添加的数据
         */
        public append(target: JQuery<HTMLElement>, value: any) {
            target.each((index, item) => {
                let domData = Pandyle.getDomData($(item));
                let context = domData.context;
                if (domData.binding['For']) {
                    let arrayName = domData.binding['For'].pattern;
                    context[arrayName].push(value);
                    let newChildren = iteratorBase.generateChild(domData, $(item).children().length, value);
                    domData.children.last().after(newChildren);
                    var arr = [];
                    arr.push.call(domData.children, newChildren);
                    this.render($(newChildren));
                } else {
                    let arrayName = domData.binding['Each'].pattern;
                    context[arrayName].push(value);
                    let newChildren = iteratorBase.generateChild(domData, $(item).children().length, value);
                    $(item).append(newChildren);
                    this.render($(newChildren));
                }
            })
        }

        public appendArray(target: JQuery<HTMLElement>, value: any[]) {
            target.each((index, item) => {
                let domData = Pandyle.getDomData($(item));
                let context = domData.context;
                if (domData.binding['For']) {
                    let arrayName = domData.binding['For'].pattern;
                    value.forEach(val => {
                        context[arrayName].push(val);
                        let newChildren = iteratorBase.generateChild(domData, $(item).children().length, val);
                        domData.children.last().after(newChildren);
                        var arr = [];
                        arr.push.call(domData.children, newChildren);
                        this.render($(newChildren));
                    })
                } else {
                    let arrayName = domData.binding['Each'].pattern;
                    value.forEach(val => {
                        context[arrayName].push(val);
                        let newChildren = iteratorBase.generateChild(domData, $(item).children().length, val);
                        $(item).append(newChildren);
                        this.render($(newChildren));
                    })
                }
            })
        }

        public run() {
            this.render(this._root, this._data, this._defaultAlias);
        }

        /**
         * 渲染指定的元素
         * @param element 渲染对象
         * @param data 数据上下文
         * @param parentProperty 父级字段的名称
         * @param alias 别名对象
         */
        public render(element: JQuery<HTMLElement>, data?: any, alias?: any) {
            element.each((index, ele) => {
                this._renderer.renderSingle(ele, data, $.extend({}, alias));
            })
        }

        public getMethod(name: string): Function {
            return this._methods[name];
        }

        public transfer(method: string, data: any[]) {
            return this._methods[method](data);
        }

        public register(name: string, value: any) {
            if ($.isFunction(value)) {
                this._methods[name] = value;
            } else {
                this._variables[name] = value;
            }
        }
    }
}