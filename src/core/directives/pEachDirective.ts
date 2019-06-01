/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />

namespace Pandyle{
    export class PEachDirective<T> extends DirectiveBase<T>{
        public execute(): void {
            let $this = this;
            let element = $(this._context.element);
            let domData = Pandyle.getDomData(element);
            let data = domData.context;
            // let data = element.data('context');
            let parentProperty = this._context.parentProperty;
            if (element.attr('p-each')) {
                domData.binding['Each'] = {
                    pattern: element.attr('p-each'),
                    related: false
                }
                // element.data('binding')['Each'] = {
                //     pattern: element.attr('p-each'),
                //     related: false
                // };
                element.removeAttr('p-each');
            }
            if (domData.binding['Each']) {
                let expression = domData.binding['Each'].pattern.replace(/\s/g, '');
                // let expression = element.data('binding')['Each'].pattern.replace(/\s/g, '');
                let property = this._util.dividePipe(expression).property;
                let target: any[] = this._util.calcu(expression, element, data);
                if(!domData.pattern){
                    domData.pattern = element.html();
                    this._util.setRelation(property, element, parentProperty);
                }      
                // if (!element.data('pattern')) {
                //     element.data('pattern', element.html());
                //     this._util.setRelation(property, element, parentProperty);
                // };
                let fullProp = property;
                if (parentProperty !== '') {
                    fullProp = parentProperty + '.' + property;
                };
                let alias = domData.alias;
                let htmlText = domData.pattern;
                // let alias = element.data('alias');
                // let htmlText = element.data('pattern');
                let children = $(htmlText);
                element.children().remove();
                if(domData.children){
                    domData.children.remove();
                    // element.data('children').remove();
                }
                target.forEach((value, index) => {
                    let newChildren = children.clone(true, true);
                    let _alias = $.extend({}, alias, { index: { data: index, property: '@index' } });
                    let childrenDomData = Pandyle.getDomData(newChildren);
                    childrenDomData.context = value;
                    childrenDomData.parentProperty = fullProp.concat('[', index.toString(), ']'),
                    childrenDomData.alias = _alias;
                    // newChildren.data({
                    //     context: value,
                    //     parentProperty: fullProp.concat('[', index.toString(), ']'),
                    //     alias: _alias
                    // });
                    element.append(newChildren);
                })
                domData.children = element.children();
                // element.data('children', element.children());
            }
            this.next();
        }
        
    }
}