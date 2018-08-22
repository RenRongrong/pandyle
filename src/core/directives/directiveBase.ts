/// <reference path="../util.ts" />

namespace Pandyle{
    export abstract class directiveBase<T>{
        protected _element: HTMLElement;
        protected _parentProperty: string;
        protected _next : directiveBase<T>;
        protected _util : Util<T>;

        protected constructor(element:HTMLElement, parentProperty:string, util:Util<T>){
            this._element = element;
            this._parentProperty = parentProperty;
            this._util = util;
        }

        public abstract execute(): void;

        protected next(){
            this._next.execute();
        }

        protected deep(){

        }

        public append(next: directiveBase<T>){
            this._next = next;
        }
    }
}
