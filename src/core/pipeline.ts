/// <reference path="directives/directiveBase.ts" />
/// <reference path="directives/pBIndDirective.ts" />
/// <reference path="directives/pComDirective.ts" />

namespace Pandyle{
    export class pipeLine<T>{
        private firstDirective: directiveBase<T>;
        private lastDirective : directiveBase<T>;

        private constructor<T>(){};

        public add(directive:directiveBase<T>){
            if(!this.firstDirective){
                this.firstDirective = this.lastDirective = directive;
            }else{
                this.lastDirective.append(directive);
                this.lastDirective = directive;
            }
            return this;
        }

        public static createPipeLine<T>(){
            return new pipeLine<T>();
        }
    }
}