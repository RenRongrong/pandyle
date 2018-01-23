namespace Pandyle {

    interface relation {
        property: string;
        elements: JQuery<HTMLElement>[];
    }

    interface binding {
        attr: string;
        pattern: string;
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
                if (properties.length == 0) {
                    this._data[lastProperty] = newData[key];
                } else {
                    let target = properties.reduce<object>((obj, current) => {
                        return obj[current];
                    }, this._data);
                    target[lastProperty] = newData[key];
                }
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

        private setBind(element: JQuery<HTMLElement>, data: object) {
            element.each((index, ele) => {
                $(ele).data('context', data);
                if(!$(ele).data('binding')){
                    $(ele).data('binding', {});
                }
                this.bindAttr(ele);
                if ($(ele).attr('p-each')) {
                    this.bindFor($(ele), data);
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

        private bindAttr(ele: HTMLElement) {
            if ($(ele).attr('p-bind')) {
                let binds = $(ele).attr('p-bind').split(';');
                binds.forEach((bindInfo, index) => {
                    let array = bindInfo.split(':');
                    let attr = array[0].replace(/\s/g, '');
                    let value = array[1];
                    let reg = /{{\s*([\w\.]*)\s*}}/g;
                    if (reg.test(value)) {
                        $(ele).data('binding')[attr] = value;
                    }
                });
                $(ele).removeAttr('p-bind');
            }
            let bindings = $(ele).data('binding');
            let data = $(ele).data('context');
            for(let a in bindings){
                if(a != 'text'){
                    $(ele).attr(a, this.convertFromPattern($(ele), a, bindings[a], data));
                }
            }
        }

        private bindFor(element: JQuery<HTMLElement>, data: object) {
            if (element.attr('p-each')) {
                let property = element.attr('p-each').replace(/\s/g, '');
                let nodes = property.split('.');
                this.setRelation(property, element);
                let target: any[] = nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
                if(!element.data('pattern')){
                    element.data('pattern', element.html());
                }
                let children = $(element.data('pattern'));
                element.children().remove();
                for(let i = 0; i < target.length; i++){
                    let newChildren = children.clone(true, true);
                    element.append(newChildren);
                    this.setBind(newChildren, target[i]);
                }
            }
        }

        private bindText(element: JQuery<HTMLElement>) {
            let data = element.data('context');
            let text = element.text();
            let reg = /{{\s*([\w\.]*)\s*}}/g;
            if (!element.data('binding')) {
                element.data('binding', {});
                if (reg.test(text)) {
                    element.data('binding').text = text;
                }
            }
            else {
                text = element.data('binding').text || text;
            }
            let result = text.replace(reg, ($0, $1) => {
                this.setRelation($1, element);
                let nodes: string[] = $1.split('.');
                return nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
            });
            element.text(result);
        }

        private convertFromPattern(element:JQuery<HTMLElement>, prop:string, pattern:string, data:object){
            let reg = /{{\s*([\w\.]*)\s*}}/g;
            let related = true;
            if(reg.test(pattern)){
                if(!element.data('binding')[prop]){
                    element.data('binding')[prop] = pattern;
                    related = false;
                }
            }
            let result = pattern.replace(reg, ($0, $1) => {
                if(!related){
                    this.setRelation($1, element);
                }
                let nodes: string[] = $1.split('.');
                return nodes.reduce((obj, current) => {
                    return obj[current];
                }, data);
            });
            return result;
        }

        private setRelation(property: string, element: JQuery<HTMLElement>) {
            let relation = this._relations.filter(value => value.property == property);
            if (relation.length == 0) {
                this._relations.push({
                    property: property,
                    elements: [element]
                });
            } else {
                relation[0].elements.push(element);
            }
        }

        
    }
}