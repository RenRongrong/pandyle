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
                let parentProperty = this._context.parentProperty;
                if (element.attr(this._directiveName)) {
                    domData.binding[this._directiveBinding] = {
                        pattern: element.attr(this._directiveName),
                        related: false
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
                        this._util.setRelation(property, element, parentProperty);
                    };
                    let fullProp = property;
                    if (parentProperty !== '') {
                        fullProp = parentProperty + '.' + property;
                    };

                    this.addChildren(element, target, fullProp);
                }
                this.next();
            } catch (err) {
                this.error('p-for', err.message, domData);
            }
        }

        public abstract addChildren(element:JQuery<HTMLElement>, targetArray: any[], fullProp: string): void;

        public static generateChild(domData: IDomData, index:number, value:any, fullProp:string) {
            let alias = domData.alias;
            let htmlText = domData.pattern;
            let children = $(htmlText);
            let newChildren = children.clone(true, true);
            let _alias = $.extend({}, alias, { index: { data: index, property: '@index' } });
            let childrenDomData = Pandyle.getDomData(newChildren);
            childrenDomData.context = value;
            childrenDomData.parentProperty = fullProp.concat('[', index.toString(), ']');
            childrenDomData.alias = _alias;
            return newChildren;
        }
    }
}