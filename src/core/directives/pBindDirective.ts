/// <reference path="../util.ts" />

namespace Pandyle {
    export class pBindDirective<T> extends directiveBase<T> {

        constructor(element: HTMLElement, parentProperty: string, util: Util<T>) {
            super(element, parentProperty, util);
        }

        public execute() {
            let ele = $(this._element);
            if (ele.attr('p-bind')) {
                let binds = $(ele).attr('p-bind').split('^');
                binds.forEach((bindInfo, index) => {
                    let array = bindInfo.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
                    let attr = array[1];
                    let value = array[2].replace(/\s*$/, '');
                    ele.data('binding')[attr] = {
                        pattern: value,
                        related: false
                    }
                });
                ele.removeAttr('p-bind');
            }
            let bindings = ele.data('binding');
            let data = ele.data('context');
            for (let a in bindings) {
                if (a !== 'text' && a !== 'if') {
                    $(ele).attr(a, this._util.convertFromPattern($(ele), a, bindings[a].pattern, data, this._parentProperty));
                }
            }
            this.next();
        }
    }
}