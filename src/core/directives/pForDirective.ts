/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />
/// <reference path="iteratorBase.ts" />

namespace Pandyle {
    export class PForDirective<T> extends iteratorBase<T>{
        constructor(){
            super();
            this._directiveBinding = "For";
            this._directiveName = "p-for";
        }
        public addChildren(element: JQuery<HTMLElement>, targetArray: any[], fullProp: string): void {
            let domData = Pandyle.getDomData(element);
            element.children().remove();
            if (domData.children) {
                domData.children.remove();
            }
            let div = $('<div />');
            targetArray.forEach((value, index) => {
                let newChildren = iteratorBase.generateChild(domData, index, value, fullProp);
                div.append(newChildren);
            })
            let actualChildren = div.children();

            domData.children = actualChildren;
            element.detach();

            let pindex = domData.pIndex;
            let pre = domData.parent.children().filter((index, ele) => {
                return Pandyle.getDomData($(ele)).pIndex === (pindex - 1);
            })
            if (pre.length > 0) {
                actualChildren.insertAfter(pre);
            } else {
                domData.parent.prepend(actualChildren);
            }
        }
    }
}