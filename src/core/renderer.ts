namespace Pandyle{
    export class Renderer<T>{

        private _util : Util<T>;
        private _pipeline: PipeLine<T>;

        public constructor(vm:VM<T>){
            this._util = Util.CreateUtil<T>(vm);
            this._pipeline = PipeLine.createPipeLine(this._util);
        };

        public renderSingle(ele: HTMLElement, data: any, parentProperty: string, alias?: any){
            let element = $(ele);
            if (!element.data('context')) {
                element.data('context', data);
            }
            if (!element.data('binding')) {
                element.data('binding', {});
            }
            if(!element.data('parentProperty')){
                element.data('parentProperty', parentProperty);
            }
            if (alias && !$.isEmptyObject(alias) && !(element.data('alias'))) {
                element.data('alias', alias);
            }
            data = element.data('context');
            parentProperty = element.data('parentProperty');
            this._util.setAlias(element, parentProperty, data);
            this.renderPipe(ele, parentProperty);
            data = element.data('context');
            this.renderChild(ele, data, parentProperty);
        }

        public renderChild(ele: HTMLElement, data: any, parentProperty: string){
            let $this = this;
            let element = $(ele);
            if(!element.data('children')){
                element.data('children', element.children());
            }
            let children:JQuery<HTMLElement> = element.data('children');
            if (children.length > 0) {
                let alias = element.data('alias');
                children.each((index, item) => {
                    let child = $(item);
                    if(!child.data('context')){
                        child.data('context', data);
                    }
                    child.data('pindex', index);
                    $this.renderSingle(child[0], data, parentProperty, $.extend({}, alias));
                })
            }
        }

        public renderPipe(ele: HTMLElement, parentProperty: string){
            let context : IPipeContext = {
                element: ele,
                parentProperty: parentProperty
            };
            this._pipeline.start(context);
        }
    }
}