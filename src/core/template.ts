namespace Pandyle {

    interface relation {
        property: string;
        elements: JQuery<HTMLElement>[];
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
                if(properties.length > 0){
                    target = properties.reduce((obj, current) => {
                        return obj[current];
                    }, this._data);
                }
                target[lastProperty] = newData[key];
                let relation = this._relations.filter(value => value.property == key);
                if (relation.length > 0) {
                    relation[0].elements.forEach(ele => {
                        this.setBind(ele, this._data);
                    })
                }
            }
        }

        private init() {
            this.setBind(this._root, this._data);
        }

        private setBind(element: JQuery<HTMLElement>, data: object, parentProperty: string = '') {
            element.each((index, ele) => {
                if(!$(ele).data('context')){
                    $(ele).data('context', data);
                }
                if (!$(ele).data('binding')) {
                    $(ele).data('binding', {});
                }
                this.bindAttr(ele, parentProperty);
                if ($(ele).attr('p-each')) {
                    this.bindFor($(ele), data, parentProperty);
                } else if ($(ele).children().length > 0) {
                    for (let i = 0; i < $(ele).children().length; i++) {
                        let child = $($(ele).children()[i]);
                        child.data('context', data);
                        this.setBind(child, data);
                    }
                } else {
                    this.bindText($(ele))
                }
            })
        }

        private bindAttr(ele: HTMLElement, parentProperty:string = '') {
            let related = true;
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
                related = false;
            }
            let bindings = $(ele).data('binding');
            let data = $(ele).data('context');
            for (let a in bindings) {
                if (a != 'text') {
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a].pattern, data));
                }
            }
        }

        private bindFor(element: JQuery<HTMLElement>, data: object, parentProperty:string = '') {
            if (element.attr('p-each')) {
                let property = element.attr('p-each').replace(/\s/g, '');
                let nodes = property.split('.');
                let target: any[] = nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
                if (!element.data('pattern')) {
                    element.data('pattern', element.html());
                    this.setRelation(property, element);
                }
                let htmlText = element.data('pattern');
                let children = $('<div />').html(htmlText).children();
                element.children().remove();
                for (let i = 0; i < target.length; i++) {
                    let newChildren = children.clone(true, true);
                    element.append(newChildren);
                    this.setBind(newChildren, target[i]);
                }
            }
        }

        private bindText(element: JQuery<HTMLElement>, parentProperty:string = '') {
            let data = element.data('context');
            let text = element.text();
            if(element.data('binding').text){
                text = element.data('binding').text.pattern;
            }
            let result = this.convertFromPattern(element, 'text', text, data);
            element.text(result);
        }

        private convertFromPattern(element: JQuery<HTMLElement>, prop: string, pattern: string, data: object, parentProperty:string = '') {
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
                    this.setRelation($1, element);
                    element.data('binding')[prop].related = true;
                }
                let nodes: string[] = $1.split('.');
                return nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
            });
            return result;
        }

        private setRelation(property: string, element: JQuery<HTMLElement>, parentProperty:string = '') {
            if(parentProperty != ''){
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
    }
}