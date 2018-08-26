/// <reference path="../util.ts" />
/// <reference path="../interfaces/IPipeContext.ts" />

namespace Pandyle{
    export abstract class DirectiveBase<T>{
        protected _next : DirectiveBase<T>;
        protected _util : Util<T>;
        protected _context: IPipeContext;

        public abstract execute(): void;

        protected next(){
            this._next.init(this._context, this._util);
            this._next.execute();
        }

        protected deep(){

        }

        public append(next: DirectiveBase<T>){
            this._next = next;
        }

        public init(context: IPipeContext, util:Util<T>){
            this._context = context;
            this._util = util;
        }
    }
}
