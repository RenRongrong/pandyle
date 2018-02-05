export module Pandyle {
    const _variables: object = {};
    const _methods: object = {};
    const _filters: object = {};
    const _converters: object = {};

    function getMethod(name: string): Function {
        return _methods[name];
    }

    function hasSuffix(target: string, suffix: string) {
        let reg = new RegExp('/^\w+' + suffix + '$/');
        return reg.test(target);
    }

    export function register(name: string, value: any) {
        if ($.isFunction(value)) {
            if (hasSuffix(name, 'Filter')) {
                _filters[name] = value;
            } else if (hasSuffix(name, 'Converter')) {
                _converters[name] = value;
            } else {
                _methods[name] = value;
            }
        } else {
            _variables[name] = value;
        }
    }

    interface relation {
        property: string;
        elements: JQuery<HTMLElement>[];
    }

    export class VM {
        private _data: object;
        private _relations: relation[];
        private _root: JQuery<HTMLElement>;
        private _methods: object;
        private _filters: object;
        private _converters: object;
        private _variables: object;

        constructor(element: JQuery<HTMLElement>, data: object, autoRun: boolean = true) {
            this._data = data;
            this._root = element;
            this._relations = [];
            this._methods = {};
            this._filters = {};
            this._converters = {};
            this._variables = {};
            if(autoRun){
                this.run();
            }
        }

        public set(newData: object) {
            for (let key in newData) {
                let properties = key.split('.');
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
                        this.render(ele, this._data, '');
                    })
                }
            }
        }

        public get(param: any) {
            switch ($.type(param)) {
                case 'array':
                    return param.map(value => this.get(value));
                case 'string':
                    return this.getValue(param, this._data);
                case 'object':
                    let result = {};
                    for (let key in param) {
                        result[key] = this.getValue(param[key], this._data);
                    }
                    return result;
                default:
                    return null;
            }
        }

        public run() {
            this.render(this._root, this._data, '');
        }

        private render(element: JQuery<HTMLElement>, data: object, parentProperty) {
            element.each((index, ele) => {
                if (!$(ele).data('context')) {
                    $(ele).data('context', data);
                }
                if (!$(ele).data('binding')) {
                    $(ele).data('binding', {});
                }
                this.bindAttr(ele, parentProperty);
                this.bindIf(ele, parentProperty);
                if ($(ele).attr('p-each')) {
                    this.renderEach($(ele), data, parentProperty);
                } else if ($(ele).children().length > 0) {
                    for (let i = 0; i < $(ele).children().length; i++) {
                        let child = $($(ele).children()[i]);
                        child.data('context', data);
                        this.render(child, data, parentProperty);
                    }
                } else {
                    this.renderText($(ele), parentProperty);
                }
            })
        }

        private bindAttr(ele: HTMLElement, parentProperty) {
            if ($(ele).attr('p-bind')) {
                let binds = $(ele).attr('p-bind').split('^');
                binds.forEach((bindInfo, index) => {
                    let array = bindInfo.split(':');
                    let attr = array[0].replace(/\s/g, '');
                    let value = array[1];
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
                if (a != 'text' && a != 'if') {
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a].pattern, data, parentProperty));
                }
            }
        }

        private bindIf(ele: HTMLElement, parentProperty) {
            if ($(ele).attr('p-if')) {
                $(ele).data('binding')['if'] = {
                    pattern: $(ele).attr('p-if'),
                    related: false
                };
                $(ele).removeAttr('p-if');
            }
            if ($(ele).data('binding')['if']) {
                let expression: string = $(ele).data('binding')['if'].pattern;
                let data = $(ele).data('context');
                let convertedExpression = this.convertFromPattern($(ele), 'if', expression, data, parentProperty);
                let judge = new Function('return ' + convertedExpression);
                if (judge()) {
                    $(ele).show();
                } else {
                    $(ele).hide();
                }
            }
        }

        private renderEach(element: JQuery<HTMLElement>, data: object, parentProperty) {
            if (element.attr('p-each')) {
                let property = element.attr('p-each').replace(/\s/g, '');
                let nodes = property.split('.');
                let target: any[] = nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this.setRelation(property, element, parentProperty);
                }
                let htmlText = element.data('pattern');
                let children = $('<div />').html(htmlText).children();
                element.children().remove();
                for (let i = 0; i < target.length; i++) {
                    let newChildren = children.clone(true, true);
                    element.append(newChildren);
                    let fullProp = property;
                    if (parentProperty != '') {
                        fullProp = parentProperty + '.' + property;
                    }
                    this.render(newChildren, target[i], fullProp.concat('[', i.toString(), ']'));
                }
            }
        }

        private renderText(element: JQuery<HTMLElement>, parentProperty) {
            let data = element.data('context');
            let text = element.text();
            if (element.data('binding').text) {
                text = element.data('binding').text.pattern;
            }
            let result = this.convertFromPattern(element, 'text', text, data, parentProperty);
            element.text(result);
        }

        private convertFromPattern(element: JQuery<HTMLElement>, prop: string, pattern: string, data: object, parentProperty) {
            let reg = /{{\s*([\w\.\[\]\(\)\,\$\{\}\d\+\-\*\/\s]*)\s*}}/g;
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
                return this.getValue($1, data);
            });
            return result;
        }

        private setRelation(property: string, element: JQuery<HTMLElement>, parentProperty) {
            if (parentProperty != '') {
                property = parentProperty + '.' + property;
            }
            let relation = this._relations.filter(value => value.property == property);
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
            let reg = new RegExp('^' + property + '$' + '|' + '^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        }

        private isChild(property: string, subProperty: string) {
            let reg = new RegExp('^' + property + '[\\[\\.]\\w+');
            return reg.test(subProperty);
        }

        private getValue(property: string, data: any) {
            //let nodes = property.split('.');
        let nodes = property.match(/\w+((?:\(.*?\))*|(?:\[.*?\])*)/g);
            return nodes.reduce((obj, current) => {
                let arr = /^(\w+)([\(|\[].*)*/.exec(current);
                let property = arr[1];
                let tempData = obj[property];
                let symbols = arr[2];
                if (symbols) {
                    let arr = symbols.match(/\[\d+\]|\(.*\)/g);
                    return arr.reduce((obj2, current2) => {
                        if (/\[\d+\]/.test(current2)) {
                            let arrayIndex = parseInt(current2.replace(/\[(\d+)\]/, '$1'));
                            return obj2[arrayIndex];
                        } else if (/\(.*\)/.test(current2)) {
                            let params = current2.replace(/\((.*)\)/, '$1').replace(/\s/, '').split(',');
                            let computedParams = params.map(p => {
                                if (/^[A-Za-z_\$].*$/.test(p)) {
                                    return this.getValue(p, data);
                                } else {
                                    return (new Function('return ' + p))();
                                }
                            })
                            let func: Function = obj2 || this.getMethod(property) || getMethod(property) || window[property];
                            return func.apply(this, computedParams);
                        }
                    }, tempData);
                } else {
                    return tempData;
                }
            }, data)
        }

        private getMethod(name: string): Function {
            return this._methods[name];
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