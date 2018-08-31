/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PIfDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let ele = $(this._context.element);
            let parentProperty = this._context.parentProperty;
            if (ele.attr('p-if')) {
                ele.data('binding')['If'] = {
                    pattern: ele.attr('p-if'),
                    related: false
                };
                ele.removeAttr('p-if');
                console.log(ele);
            }
            if (ele.data('binding')['If']) {
                let parentElement = ele.parent();
                if (!ele.data('parent')) {
                    ele.data('parent', parentElement);
                }

                let expression: string = ele.data('binding')['If'].pattern;
                let data = ele.data('context');
                let convertedExpression = this._util.convertFromPattern(ele, 'If', expression, data, parentProperty);
                let judge = new Function('return ' + convertedExpression);

                if (judge()) {
                    if (ele.parent().length === 0) {
                        let pindex = ele.data('pindex');
                        let pre = ele.data('parent').children().filter((inex, element) => {
                            return $(element).data('pindex') == (pindex - 1);
                        })
                        if (pre.length > 0) {
                            ele.insertAfter(pre);
                        } else {
                            ele.data('parent').prepend(ele);
                        }
                    }
                    this.next();
                } else {
                    ele.detach();
                }
            } else {
                this.next();
            }
        }

    }
}