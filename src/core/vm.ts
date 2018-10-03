/// <reference path="statics.ts" />
/// <reference path="component.ts" />
/// <reference path="util.ts" />
/// <reference path="relationCollection.ts" />

namespace Pandyle {
    export class VM<T> {
        protected _data: T;
        private _root: JQuery<HTMLElement>;
        public _methods: object;
        private _variables: object;
        private _defaultAlias: object;

        public _relationCollection: IRelationCollection;
        private _util: Util<T>;
        private _renderer: Renderer<T>

        private static _uid = 1;

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
            this._relationCollection = RelationCollection.CreateRelationCollection(this._util);
            this._renderer = new Renderer(this);

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
                this._renderer.renderSingle(ele, data, parentProperty, $.extend({}, alias));
            })
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
                // this.renderChild(ele, target, fullProp);
            }
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