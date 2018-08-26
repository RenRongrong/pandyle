namespace Pandyle{
    export class Renderer<T>{

        private _util : Util<T>;

        public constructor(vm:VM<T>){
            this._util = Util.CreateUtil<T>(vm);
        };

        public renderSingle(ele: HTMLElement, data: any, parentProperty: string, alias?: any){
            let element = $(ele);
            if (!element.data('context')) {
                element.data('context', data);
            }
            if (!element.data('binding')) {
                element.data('binding', {});
            }
            if (alias && !$.isEmptyObject(alias)) {
                element.data('alias', alias);
            }
            data = element.data('context');
            this._util.setAlias(element, parentProperty, data);
            this.renderPipe(ele, parentProperty);
            this.renderChild(ele, data, parentProperty);
        }

        public renderChild(ele: HTMLElement, data: any, parentProperty: string){
            let $this = this;
            let element = $(ele);
            if (element.children().length > 0) {
                let alias = element.data('alias');
                element.children().each((index, item) => {
                    let child = $(item);
                    child.data('context', data);
                    $this.renderSingle(child[0], data, parentProperty, $.extend({}, alias));
                })
            }
        }

        public renderPipe(ele: HTMLElement, parentProperty: string){
            let context : IPipeContext = {
                element: ele,
                parentProperty: parentProperty
            };
            PipeLine.createPipeLine(context, this._util).start();
        }
    }
}