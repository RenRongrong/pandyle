/// <reference path="../util.ts" />
/// <reference path="../component.ts" />

namespace Pandyle {
    export class pComDirective<T> extends DirectiveBase<T>{

        public execute(): void {
            let ele = $(this._context.element);
            if (ele.attr('p-com')) {
                loadComponent(this._context.element);
            }
            this.next();
        }

    }
}