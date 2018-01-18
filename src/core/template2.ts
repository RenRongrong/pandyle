namespace Pandyle{

    interface relation{
        property: string;
        elements: JQuery<HTMLElement>[];
    }

    interface binding{
        attr: string;
        pattern: string;
    }

    export class VM{
        private _data: object;
        private _relations: relation[];
        private _root: JQuery<HTMLElement>;

        constructor(element:JQuery<HTMLElement>, data:object){
            this._data = data;
            this._root = element;
            this._relations = [];
            this.init();
        }

        public set(newData:object){
            for(let key in newData){
                let properties = key.split('.');
                let lastProperty = properties.pop();
                if(properties.length == 0){
                    this._data[lastProperty] = newData[key];
                }else{
                    let target = properties.reduce<object>((obj, current)=>{
                        return obj[current];
                    }, this._data);
                    target[lastProperty] = newData[key];
                }
                let relation = this._relations.filter(value => value.property == key);
                if(relation.length > 0){
                    relation[0].elements.forEach(ele=>{
                        this.setBind(ele, this._data);
                    })
                }
            }
        }

        private init(){
            this.setBind(this._root, this._data);
        }

        private setBind(element:JQuery<HTMLElement>, data:object){
            if(element.children().length > 0){
                for(let i=0; i<element.children().length; i++){
                    let child = $(element.children()[i]);
                    child.data('context', data);
                    this.setBind(child, data);
                }
            }else{
                let text = element.text();
                let reg = /{{\s*([\w\.]*)\s*}}/g;
                if(!element.data('binding')){
                    element.data('binding', []);
                    if(reg.test(text)){
                        element.data('binding').text = text;
                    }
                }else{
                    text = element.data('binding').text || text;
                }
                let result = text.replace(reg, ($0, $1) => {   
                    this.setRelation($1, element);                 
                    let nodes:string[] = $1.split('.');
                    return nodes.reduce<any>((obj, current) => {
                        return obj[current];
                    }, data);
                })
                element.text(result);
            }
        }

        private setRelation(property:string, element:JQuery<HTMLElement>){
            let relation = this._relations.filter((value)=>{
                value.property == property;
            });
            if(relation.length == 0){
                this._relations.push({
                    property: property,
                    elements: [element]
                });
            }else{
                relation[0].elements.push(element);
            }
        }
    }
}