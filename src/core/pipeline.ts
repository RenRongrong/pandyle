/// <reference path="directives/directiveBase.ts" />
/// <reference path="directives/pBIndDirective.ts" />
/// <reference path="directives/pComDirective.ts" />
/// <reference path="directives/pTextDirective.ts" />
/// <reference path="interfaces/IPipeContext.ts" />

namespace Pandyle {
    export class PipeLine<T>{
        private _firstDirective: DirectiveBase<T>;
        private _lastDirective: DirectiveBase<T>;
        private _context: IPipeContext;
        private _util: Util<T>;

        private constructor(context:IPipeContext, util: Util<T>) {
            this._util = util;
            this._context = context;
         };

        private add(directive: DirectiveBase<T>) {
            if (!this._firstDirective) {
                this._firstDirective = this._lastDirective = directive;
            } else {
                this._lastDirective.append(directive);
                this._lastDirective = directive;
            }
            return this;
        }

        public start(){
            this._firstDirective.init(this._context, this._util);
            this._firstDirective.execute();
        }

        public static createPipeLine<T>(context:IPipeContext, util: Util<T>) {
            let pipe = new PipeLine<T>(context, util);
            pipe.add(new PBindDirective())
                .add(new pComDirective())
                .add(new pTextDirective());
            return pipe;
        }

    }
}