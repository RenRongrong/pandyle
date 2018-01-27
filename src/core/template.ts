namespace Pandyle {

    interface relation {
        property: string;
        elements: JQuery<HTMLElement>[];
    }

    function getType(obj: any) {
        let type: string = Object.prototype.toString.call(obj);
        return type.replace(/^\[object\s(\w+)\]$/, '$1');
    }

    function isString(obj: any) {
        return getType(obj) == 'String';
    }

    function isNumber(obj: any) {
        return getType(obj) == 'Number';
    }

    function isBoolean(obj: any) {
        return getType(obj) == 'Boolean';
    }

    function isArray(obj: any) {
        return getType(obj) == 'Array';
    }

    function isObject(obj: any) {
        return getType(obj) == 'Object';
    }

    function isFunction(obj: any) {
        return getType(obj) == 'Function';
    }

    function isUndefined(obj: any) {
        return getType(obj) == 'Undefined';
    }

    function isNull(obj: any) {
        return getType(obj) == 'Null';
    }


    export class VM {
        private _data: object;
        private _relations: relation[];
        private _root: JQuery<HTMLElement>;

        constructor(element: JQuery<HTMLElement>, data: object) {
            this._data = data;
            this._root = element;
            this._relations = [];
            this.init();
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
                if (isArray(target[lastProperty])) {
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

        private init() {
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
                if (a != 'text') {
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a].pattern, data, parentProperty));
                }
            }
        }

        private bindIf(ele: HTMLElement, parentProperty) {
            let related = true;
            if ($(ele).attr('p-if')) {
                $(ele).data('if', $(ele).attr('p-if'));
                $(ele).removeAttr('p-if');
                related = false;
            }
            if ($(ele).data('if')) {
                let expression:string = $(ele).data('if');
                let data = $(ele).data('context');
                let convertedExpression = expression.replace(/\w+/g, ($0) => {
                    if(!related){
                        this.setRelation($0, $(ele), parentProperty);
                    }
                    return $0.split('.').reduce((obj, current) => {
                        return obj[current];
                    }, data);
                });
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
            let reg = /{{\s*([\w\.]*)\s*}}/g;
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
                let nodes: string[] = $1.split('.');
                return nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
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
    }
}