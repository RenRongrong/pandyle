/// <reference path="../util.ts" />
/// <reference path="../component.ts" />

namespace Pandyle {
    export class pComDirective<T> extends DirectiveBase<T>{

        public execute(): void {
            let ele = $(this._context.element);
            let domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-com')) {
                    loadComponent(this._context.element, this._util.vm);
                }
                this.next();
            } catch (err) {
                this.error('p-com', err.message, domData);
            }
        }

    }
}