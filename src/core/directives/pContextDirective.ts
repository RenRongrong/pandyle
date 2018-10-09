/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PContextDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let element = $(this._context.element);
            let parentProperty = this._context.parentProperty;
            if (element.attr('p-context')) {
                element.data('binding')['Context'] = {
                    pattern: element.attr('p-context'),
                    related: false
                };
                element.removeAttr('p-context');
            }
            if (element.data('binding')['Context']) {
                let data;
                let expression = element.data('binding')['Context'].pattern;
                let divided = this._util.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }

                if (element.data('ocontext')) {
                    data = element.data('ocontext');
                } else {
                    data = element.data('context');
                    // element.data('ocontext', data);
                }
                // let data = element.data('context');
                let target: any = this._util.calcu(property, element, data);
                if (method) {
                    target = this._util.convert(method, $.extend({}, target));
                }
                if (!element.data('ocontext')) {
                    this._util.setAlias(element, fullProp, target);
                    this._util.setRelation(property, $(element), parentProperty);
                    element.data('ocontext', data);
                }

                element.data({
                    context: target,
                    oparentProperty: fullProp
                })
                element.children().each((index, ele) => {
                    $(ele).data({
                        context: target
                    })
                })

                this._context.parentProperty = fullProp;
            }
            this.next();
        }

    }
}