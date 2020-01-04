/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />
/// <reference path="iteratorBase.ts" />

namespace Pandyle {
    export class PEachDirective<T> extends iteratorBase<T>{
        constructor() {
            super();
            this._directiveName = 'p-each';
            this._directiveBinding = 'Each';
        }

        public addChildren(element: JQuery<HTMLElement>, targetArray: any[], fullProp: string): void {
            let domData = Pandyle.getDomData(element);
            element.children().remove();
            if (domData.children) {
                domData.children.remove();
            }
            let arr = [];
            targetArray.forEach((value, index) => {
                let newChildren = iteratorBase.generateChild(domData, index, value, fullProp);
                arr.push(newChildren);
            })
            element.append(arr);
            domData.children = element.children();
        }
    }
}