/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PForDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let $this = this;
            let element = $(this._context.element);
            let data = element.data('context');
            let parentProperty = this._context.parentProperty;
            if (element.attr('p-for')) {
                element.data('binding')['For'] = {
                    pattern: element.attr('p-for'),
                    related: false
                };
                element.removeAttr('p-for');
            }
            if (element.data('binding')['For']) {
                let parentElement = element.parent();
                if (!element.data('parent')) {
                    element.data('parent', parentElement);
                }

                let expression = element.data('binding')['For'].pattern.replace(/\s/g, '');
                let property = this._util.dividePipe(expression).property;
                let target: any[] = this._util.calcu(expression, element, data);
                if (!element.data('pattern')) {
                    element.data('pattern', element.prop('outerHTML'));
                    this._util.setRelation(property, element, parentProperty);
                };
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                };
                let alias = element.data('alias');
                let htmlText = element.data('pattern');
                let children = $(htmlText);
                element.children().remove();
                if(element.data('children')){
                    element.data('children').remove();
                }
                let div = $('<div />');
                target.forEach((value, index) => {
                    let newChildren = children.clone(true, true);
                    let _alias = $.extend({}, alias, { index: { data: index, property: '@index' } });
                    newChildren.data({
                        context: value,
                        parentProperty: fullProp.concat('[', index.toString(), ']'),
                        alias: _alias
                    });
                    div.append(newChildren);
                })
                let actualChildren = div.children();

                element.data('children', actualChildren);
                element.detach();

                let pindex = element.data('pindex');
                let pre = element.data('parent').children().filter((inex, ele) => {
                    return $(ele).data('pindex') == (pindex - 1);
                })
                if (pre.length > 0) {
                    actualChildren.insertAfter(pre);
                } else {
                    element.data('parent').prepend(actualChildren);
                }
           
            }
            this.next();
        }

    }
}