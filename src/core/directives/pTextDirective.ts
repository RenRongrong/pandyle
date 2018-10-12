/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class pTextDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let element = $(this._context.element);
            if (element.children().length === 0) {
                let data = element.data('context');
                let text = element.text();
                if (element.data('binding').text) {
                    text = element.data('binding').text.pattern;
                }
                let result = this._util.convertFromPattern(element, 'text', text, data, this._context.parentProperty);
                element.html(result);
            }
        }

    }
}