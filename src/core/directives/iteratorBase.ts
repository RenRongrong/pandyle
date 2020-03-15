/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />
/// <reference path="../interfaces/IDomData.ts" />

namespace Pandyle {
    export abstract class iteratorBase<T> extends DirectiveBase<T> {
        protected _directiveName: string;
        protected _directiveBinding: string;

        public execute(): void {
            let $this = this;
            let element = $(this._context.element);
            let domData = Pandyle.getDomData(element);
            try {
                let data = domData.context;
                if (element.attr(this._directiveName)) {
                    domData.binding[this._directiveBinding] = {
                        pattern: element.attr(this._directiveName)
                    }
                    element.removeAttr(this._directiveName);
                }
                if (domData.binding[this._directiveBinding]) {
                    if (this._directiveName === 'p-for') {
                        let parentElement = element.parent();
                        if (!domData.parent) {
                            domData.parent = parentElement;
                        }
                    }

                    let expression = domData.binding[this._directiveBinding].pattern.replace(/\s/g, '');
                    let property = this._util.dividePipe(expression).property;
                    let target: any[] = this._util.calcu(expression, element, data);
                    if (!domData.pattern) {
                        if (this._directiveName === 'p-for') {
                            let outerHtml: string = element.prop('outerHTML');
                            outerHtml = outerHtml.replace(/jQuery\d*\="\d*"/, '');
                            domData.pattern = outerHtml;
                        } else {
                            domData.pattern = element.html();
                        }
                    };
                    let fullProp = property;

                    this.addChildren(element, target);
                }
                this.next();
            } catch (err) {
                this.error(this._directiveName, err.message, domData);
            }
        }

        public abstract addChildren(element:JQuery<HTMLElement>, targetArray: any[]): void;

        public static generateChild(domData: IDomData, index:number, value:any) {
            let alias = domData.alias;
            let htmlText = domData.pattern;
            let newChild = $(htmlText);
            let _alias = $.extend({}, alias, { index: { data: index, property: '@index' } });
            let childrenDomData = Pandyle.getDomData(newChild);
            childrenDomData.context = value;
            childrenDomData.alias = _alias;
            return newChild[0];
        }
    }
}