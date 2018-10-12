/// <reference path="directives/directiveBase.ts" />
/// <reference path="directives/pBIndDirective.ts" />
/// <reference path="directives/pComDirective.ts" />
/// <reference path="directives/pTextDirective.ts" />
/// <reference path="directives/pIfDirective.ts" />
/// <reference path="directives/pEachDirective.ts" />
/// <reference path="directives/pForDirective.ts" />
/// <reference path="directives/pContextDirective.ts" />
/// <reference path="interfaces/IPipeContext.ts" />

namespace Pandyle {
    export class PipeLine<T>{
        private _firstDirective: DirectiveBase<T>;
        private _lastDirective: DirectiveBase<T>;
        private _util: Util<T>;

        private constructor(util: Util<T>) {
            this._util = util;
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

        public start(context: IPipeContext) {
            this._firstDirective.init(context, this._util);
            this._firstDirective.execute();
        }

        public static createPipeLine<T>(util: Util<T>) {
            let pipe = new PipeLine<T>(util);
            pipe.add(new PContextDirective<T>())
                .add(new PIfDirective<T>())
                .add(new PForDirective<T>())
                .add(new PEachDirective<T>())
                .add(new PBindDirective<T>())
                .add(new pComDirective<T>())
                .add(new pTextDirective<T>());
            return pipe;
        }

    }
}