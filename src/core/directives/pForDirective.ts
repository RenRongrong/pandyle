/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle {
    export class PForDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let $this = this;
            let element = $(this._context.element);
            let domData = Pandyle.getDomData(element);
            try {
                let data = domData.context;
                let parentProperty = this._context.parentProperty;
                if (element.attr('p-for')) {
                    domData.binding['For'] = {
                        pattern: element.attr('p-for'),
                        related: false
                    }
                    element.removeAttr('p-for');
                }
                if (domData.binding['For']) {
                    let parentElement = element.parent();
                    if (!domData.parent) {
                        domData.parent = parentElement;
                    }

                    let expression = domData.binding['For'].pattern.replace(/\s/g, '');
                    let property = this._util.dividePipe(expression).property;
                    let target: any[] = this._util.calcu(expression, element, data);
                    if (!domData.pattern) {
                        let outerHtml: string = element.prop('outerHTML');
                        outerHtml = outerHtml.replace(/jQuery\d*\="\d*"/, '');
                        domData.pattern = outerHtml;
                        this._util.setRelation(property, element, parentProperty);
                    };
                    let fullProp = property;
                    if (parentProperty !== '') {
                        fullProp = parentProperty + '.' + property;
                    };
                    let alias = domData.alias;
                    let htmlText = domData.pattern;
                    let children = $(htmlText);
                    element.children().remove();
                    if (domData.children) {
                        domData.children.remove();
                    }
                    let div = $('<div />');
                    target.forEach((value, index) => {
                        let newChildren = children.clone(true, true);
                        let _alias = $.extend({}, alias, { index: { data: index, property: '@index' } });
                        let childrenDomData = Pandyle.getDomData(newChildren);
                        childrenDomData.context = value;
                        childrenDomData.parentProperty = fullProp.concat('[', index.toString(), ']'),
                            childrenDomData.alias = _alias;
                        div.append(newChildren);
                    })
                    let actualChildren = div.children();

                    domData.children = actualChildren;
                    element.detach();

                    let pindex = domData.pIndex;
                    let pre = domData.parent.children().filter((index, ele) => {
                        return Pandyle.getDomData($(ele)).pIndex === (pindex - 1);
                    })
                    if (pre.length > 0) {
                        actualChildren.insertAfter(pre);
                    } else {
                        domData.parent.prepend(actualChildren);
                    }
                }
                this.next();
            } catch (err) {
                this.error('p-for', err.message, domData);
            }
        }

    }
}