/// <reference path="interfaces/IRelation.ts" />
/// <reference path="interfaces/IRelationCollection.ts" />

namespace Pandyle {
    export class relationCollection<T> implements IRelationCollection {
        private _util: Util<T>;
        private _relations: IRelation[];

        private constructor(util:Util<T>){
            this._util = util;
            this._relations = [];
        }

        public static CreateRelationCollection<T>(util: Util<T>){
            return new relationCollection(util);
        }

        public setRelation(property: string, element: JQuery<HTMLElement>, parentProperty: string) {
            if (/^@.*/.test(property)) {
                property = property.replace(/@(\w+)?/, ($0, $1) => {
                    return this._util.getAliasProperty(element, $1);
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

        public findSelfOrChild(key:string){
            return this._relations.filter(value => this._util.isSelfOrChild(key, value.property));
        }

        public removeChildren(key:string){
            for (let i = this._relations.length - 1; i >= 0; i--) {
                if (this._util.isChild(key, this._relations[i].property)) {
                    this._relations.splice(i, 1);
                }
            }
        }
    }
}