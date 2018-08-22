namespace Pandyle{
    export class renderer{
        private static _renderer : renderer;

        private constructor(){};

        public static getRenderer(){
            if(undefined === this._renderer){
                this._renderer = new renderer();
            }
            return this._renderer;
        }

        public renderSingle(ele: HTMLElement, data: any, parentProperty: string, alias?: any){

        }

        public renderChild(ele: HTMLElement, data: any, parentProperty: string){

        }

        public renderPipe(ele: HTMLElement){

        }
    }
}