/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PContextDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let element = $(this._context.element);
            let domData = Pandyle.getDomData(element);
            let binding = domData.binding;
            try {
                if (element.attr('p-context')) {
                    binding['Context'] = {
                        pattern: element.attr('p-context')
                    }
                    element.removeAttr('p-context');
                }
                if (binding['Context']) {
                    let data;
                    let expression = binding['Context'].pattern;
                    let divided = this._util.dividePipe(expression);
                    let property = divided.property;
                    let method = divided.method;

                    if (domData.ocontext) {
                        data = domData.ocontext;
                    } else {
                        data = domData.context;
                    }
                    let target: any = this._util.calcu(property, element, data);
                    if (method) {
                        target = this._util.convert(method, $.extend({}, target));
                    }
                    if (!domData.ocontext) {
                        this._util.setAlias(element, target);
                        domData.ocontext = data;
                    }
                    domData.context = target;

                    element.find('*').each((index, ele) => {
                        Pandyle.getDomData($(ele)).context = null
                    })
                }
                this.next();
            } catch (err) {
                this.error('p-context', err.message, domData);
            }
        }

    }
}