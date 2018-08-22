/// <reference path="../util.ts" />
/// <reference path="../component.ts" />

namespace Pandyle {
    export class pComDirective<T> extends directiveBase<T>{

        constructor(element: HTMLElement, parentProperty: string, util: Util<T>) {
            super(element, parentProperty, util);
        }

        public execute(): void {
            let ele = $(this._element);
            if (ele.attr('p-com')) {
                loadComponent(this._element);
            }
            this.next();
        }

    }
}