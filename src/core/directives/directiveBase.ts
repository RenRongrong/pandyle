/// <reference path="../util.ts" />
/// <reference path="../interfaces/IPipeContext.ts" />

namespace Pandyle {
    export abstract class DirectiveBase<T>{
        protected _next: DirectiveBase<T>;
        protected _util: Util<T>;
        protected _context: IPipeContext;

        public abstract execute(): void;

        protected next() {
            if (this._next) {
                this._next.init(this._context, this._util);
                this._next.execute();
            }
        }

        protected deep() {

        }

        protected error(directiveName: string, errorMessage: string, domData:IDomData) {
            console.error(`在执行${directiveName}指令时发生错误。错误信息：${errorMessage}`);
            console.log('当前元素为：');
            console.log(this._context.element);
            console.log('当前元素的数据上下文：');
            console.log(domData);
        }

        public append(next: DirectiveBase<T>) {
            this._next = next;
        }

        public init(context: IPipeContext, util: Util<T>) {
            this._context = context;
            this._util = util;
        }
    }
}
