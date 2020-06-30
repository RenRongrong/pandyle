/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class pTextDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let element = $(this._context.element);
            let domData = Pandyle.getDomData(element);
            try {
                if (element.children().length === 0) {
                    let data = domData.context;
                    let text = element.text();
                    if (domData.binding['text']) {
                        text = domData.binding['text'].pattern;
                    }
                    let result = this._util.convertFromPattern(element, 'text', text, data);
                    element.text(result);
                }
            } catch (err) {
                this.error('文本插值', err.message, domData);
            }
        }
    }
}