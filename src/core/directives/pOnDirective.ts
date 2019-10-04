/// <reference path="../util.ts" />
/// <reference path="directiveBase.ts" />
/// <reference path="../interfaces/IDomData.ts" />

namespace Pandyle {
    export class POnDirective<T> extends DirectiveBase<T> {
        public execute(): void {
            let ele = $(this._context.element);
            let domData = Pandyle.getDomData(ele);
            try {
                if (ele.attr('p-on')) {
                    let binds = $(ele).attr('p-on').split('^');
                    binds.forEach((bindInfo, index) => {
                        let array = bindInfo.match(/^\s*([\w-]+)\s*:\s*(.*)$/);
                        let event = array[1];
                        let handler = array[2].replace(/\s*$/, '');
                        ele.on(event, ()=>{
                            this._util.calcu(handler, ele, domData.context);
                        })
                    });
                    ele.removeAttr('p-on');
                }
                this.next();
            }catch(err){
                this.error('p-on', err.message, domData);
            }
        }

    }
}