/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PContextDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let element = $(this._context.element);
            let parentProperty = this._context.parentProperty;
            let domData = Pandyle.getDomData(element);
            let binding = domData.binding;
            if (element.attr('p-context')) {               
                binding['Context'] = {
                    pattern: element.attr('p-context'),
                    related: false
                }
                element.removeAttr('p-context');
            }
            if (binding['Context']) {
                let data;
                let expression = binding['Context'].pattern;
                let divided = this._util.dividePipe(expression);
                let property = divided.property;
                let method = divided.method;
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                }

                if(domData.ocontext){
                    data = domData.ocontext;
                }else{
                    data = domData.context;
                }
                let target: any = this._util.calcu(property, element, data);
                if (method) {
                    target = this._util.convert(method, $.extend({}, target));
                }
                if(!domData.ocontext){
                    this._util.setAlias(element, fullProp, target);
                    this._util.setRelation(property, $(element), parentProperty);
                    domData.ocontext = data;
                }
                domData.context = target;
                domData.oparentProperty = fullProp;

                element.children().each((index, ele) => {
                    Pandyle.getDomData($(ele)).context = target;
                })

                this._context.parentProperty = fullProp;
            }
            this.next();
        }

    }
}