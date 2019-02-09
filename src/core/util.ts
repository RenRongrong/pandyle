/// <reference path="statics.ts" />
/// <reference path="vm.ts" />

namespace Pandyle {
    export class Util<T>{
        private _vm: VM<T>;

        private constructor(vm: VM<T>) {
            this._vm = vm;
        }

        public static CreateUtil<T>(vm: VM<T>) {
            let util = new Util(vm);
            return util;
        }

        /**
         * 获取表达式的值
         * @param element 目标对象
         * @param property 表达式字符串
         * @param data 数据上下文
         */
        public getValue(element: JQuery<HTMLElement>, property: string, data: any) {
            //let result = this.calcu(property, element, data);
            let result = this.calcuExpression(property, element, data);
            let type = $.type(result);
            if (type === 'string') {
                result = unescape(result);
            }
            if (type === 'string' || type === 'number' || type === 'boolean' || type === 'null' || type === 'undefined') {
                return result;
            } else {
                return $.extend(this.toDefault(type), result);
            }
        }

        public calcuExpression(property: string, element: JQuery<HTMLElement>, data: any) {
            let reg = /[^\+\-\*\/\?\:\>\=\<\|\&\!]+/g;
            let reg2 = /[\+\-\*\/\?\:\>\=\<\|\&\!]/g;
            if(reg2.test(property)){
                let funcStr = property.replace(reg, ($0) => {
                    let result = this.calcu($0, element, data);
                    if ($.type(result) === 'string') {
                        result = "'" + escape(result) + "'";
                    }
                    return result;
                })
                return new Function('return ' + funcStr)();
            }else{
                return this.calcu(property, element, data);
            }
            
            // let items = property.split(/\+|\-|\*|\/|\?|\:|\>\=?|\<\=?|\={1,3}/);

        }

        /**
         * 根据表达式字符串计算值
         * @param property 表达式
         * @param element 表达式所在的对象
         * @param data 数据上下文
         */
        public calcu(property: string, element: JQuery<HTMLElement>, data: any) {
            let devided = this.dividePipe(property);
            property = devided.property;
            if (['null', 'undefined', 'true', 'false'].indexOf(property) > -1) {
                return new Function('return ' + property)();
            }
            if (property.match(/^('|"|\d).*$/)) {
                return new Function('return ' + property)();
            }
            let method = devided.method;
            let nodes = property.match(/[@\w]+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            if (!nodes) {
                return property;
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
                                    if (p === '') {
                                        p = '""';
                                    }
                                    return (new Function('return ' + p))();
                                }
                            });
                            let func: Function = obj2 || this._vm.getMethod(property) || getMethod(property) || window[property];
                            return func.apply(this, computedParams);
                        }
                    }, tempData);
                }
                else {
                    return tempData;
                }
            }, data);
            if (method) {
                return this.transfer(method, result);
            } else {
                return result;
            }
        }

        /**
         * 将带文本插值的字符串模板转换成正常字符串
         * @param element 文本所在的对象
         * @param prop 绑定的属性
         * @param pattern 字符串模板
         * @param data 数据上下文
         * @param parentProperty 父级字段的名称
         */
        public convertFromPattern(element: JQuery<HTMLElement>, prop: string, pattern: string, data: object, parentProperty) {
            //let reg = /{{\s*([\w\.\[\]\(\)\,\$@\{\}\d\+\-\*\/\|\s]*?)\s*}}/g;
            let reg = /{{\s*(.*?)\s*}}/g;
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
                let property = this.dividePipe($1).property;
                if (!related) {
                    this._vm._relationCollection.setRelation(property, element, parentProperty);
                    element.data('binding')[prop].related = true;
                }
                return this.getValue(element, $1, data);
            });
            return result;
        }


        public toDefault(type: string) {
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

        public setAlias(element: JQuery<HTMLElement>, property: string, data?: any) {
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

        public getAliasData(element: JQuery<HTMLElement>, alias: string) {
            let data = element.data('alias');
            return data[alias].data;
        }

        public getAliasProperty(element: JQuery<HTMLElement>, alias: string) {
            let data = element.data('alias');
            return data[alias].property;
        }



        public dividePipe(expression: string) {
            let array = expression.split('|');
            let property = array[0].replace(/\s/g, '');
            let method = array[1] ? array[1].replace(/\s/g, '') : null;
            return {
                property: property,
                method: method
            }
        }

        public convert(method: string, data: any) {
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
                return this._vm._methods[method](data);
            }
        }

        /**
         * 从字段名称判断一个字段是否跟目标字段一致或属于目标字段的子字段
         * @param property 目标字段
         * @param subProperty 子字段
         */
        public isSelfOrChild(property: string, subProperty: string) {
            property = property.replace(/[\[\]\(\)\.]/g, $0 => {
                return '\\' + $0;
            })
            let reg = new RegExp('^' + property + '$' + '|' + '^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        }

        /**
         * 从字段名称判断一个字段是否属于目标字段的子字段
         * @param property 目标字段
         * @param subProperty 子字段
         */
        public isChild(property: string, subProperty: string) {
            let reg = new RegExp('^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        }

        public transfer(method: string, data: any[]) {
            return this._vm.transfer(method, data);
        }

        public setRelation(property: string, element: JQuery<HTMLElement>, parentProperty: string) {
            this._vm._relationCollection.setRelation(property, element, parentProperty);
        }
    }
}