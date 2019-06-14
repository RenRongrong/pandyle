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
            let domData = Pandyle.getDomData(element);

            if(!domData.context){
                domData.context = data;
            }
            if(!domData.binding){
                domData.binding = {};
            }
            if(!domData.parentProperty){
                domData.parentProperty = parentProperty;
            }
            if(alias && !$.isEmptyObject(alias) && !domData.alias){
                domData.alias = alias;
            }
            data = domData.context;
            parentProperty = domData.parentProperty;
            
            this._util.setAlias(element, parentProperty, data);
            this.renderPipe(ele, parentProperty);
            data = domData.context;
            if(domData.oparentProperty){
                parentProperty = domData.oparentProperty;
            }
            this.renderChild(ele, data, parentProperty);
        }

        public renderChild(ele: HTMLElement, data: any, parentProperty: string){
            let $this = this;
            let element = $(ele);
            let domData = Pandyle.getDomData(element);
            if(!domData.children){
                domData.children = element.children();
            }
            let children = domData.children;
            if (children.length > 0) {
                let alias = domData.alias;
                children.each((index, item) => {
                    let child = $(item);
                    let childDomData = Pandyle.getDomData(child);
                    if(!childDomData.context){
                        childDomData.context = data;
                    }
                    childDomData.pIndex = index;
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