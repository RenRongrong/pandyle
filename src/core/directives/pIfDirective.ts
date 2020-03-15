/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PIfDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let ele = $(this._context.element);
            let domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-if')) {
                    domData.binding['If'] = {
                        pattern: ele.attr('p-if')
                    }
                    ele.removeAttr('p-if');
                }
                if (domData.binding['If']) {
                    let parentElement = ele.parent();
                    if (!domData.parent) {
                        domData.parent = parentElement;
                    }
                    let expression = domData.binding['If'].pattern;
                    let data = domData.context;
                    let convertedExpression = this._util.convertFromPattern(ele, 'If', expression, data);
                    let judge = new Function('return ' + convertedExpression);
                    if (judge()) {
                        if (ele.parent().length === 0) {
                            let pindex = domData.pIndex;
                            let pre = domData.parent.children().filter((index, element) => {
                                return Pandyle.getDomData($(element)).pIndex === (pindex - 1);
                            })
                            if (pre.length > 0) {
                                ele.insertAfter(pre);
                            } else {
                                domData.parent.prepend(ele);
                            }
                        }
                        this.next();
                    } else {
                        ele.detach();
                    }
                } else {
                    this.next();
                }
            }catch(err){
                this.error('p-if', err.message, domData);
            }
        }
    }
}