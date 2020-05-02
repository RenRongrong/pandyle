/// <reference path="../util.ts" />
/// <reference path="../interfaces/IDomData.ts" />

namespace Pandyle {
    export class PBindDirective<T> extends DirectiveBase<T> {

        public execute() {
            let ele = $(this._context.element);
            let domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-bind')) {
                    let binds = $(ele).attr('p-bind').split('^');
                    binds.forEach((bindInfo, index) => {
                        let array = bindInfo.match(/^\s*([\w-\?]+)\s*:\s*(.*)$/);
                        let attr = array[1];
                        let value = array[2].replace(/\s*$/, '');
                        domData.binding[attr] = {
                            pattern: value,
                            related: false
                        }
                    });
                    ele.removeAttr('p-bind');
                }
                let bindings = domData.binding;
                let data = domData.context;
                for (let a in bindings) {
                    if (['text', 'If', 'Each', 'For', 'Context'].indexOf(a) < 0) {
                        let value = this._util.convertFromPattern($(ele), a, bindings[a].pattern, data, this._context.parentProperty);
                        if (a.endsWith('?')) {
                            let attr = a.replace(/\?$/, '');
                            value == 'true' ? $(ele).attr(attr, attr) : $(ele).removeAttr(attr);
                        } else {
                            $(ele).attr(a, value);
                        }
                    }
                }
                this.next();
            } catch (err) {
                this.error('p-bind', err.message, domData);
            }
            
        }
    }
}