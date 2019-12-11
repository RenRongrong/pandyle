/// <reference path="../src/index.d.ts" />
declare namespace Pandyle {
    const _variables: any;
    const _methods: any;
    const _filters: any;
    const _converters: any;
    const _components: any;
    const _config: any;
    var $: JQueryStatic;
    function getMethod(name: string): Function;
    function hasSuffix(target: string, suffix: string): boolean;
    function register(name: string, value: any): void;
    interface relation {
        property: string;
        elements: JQuery<HTMLElement>[];
    }
    function config(options: JSON): void;
    function getDomData(element: JQuery<HTMLElement>): IDomData;
}
declare namespace Pandyle {
    class Component implements IComponent {
        readonly name: string;
        html: string;
        onLoad: <T>(context: any, root: HTMLElement, vm: VM<T>) => void;
        private setPrivateData(element, data);
        private afterRender(element, handler);
        private getPrivateData(root);
        constructor(name: string, html: string);
    }
    interface IComponent {
        name: string;
        html: string;
        onLoad?: <T>(context: any, root: HTMLElement, vm: VM<T>) => void;
    }
    function hasComponent(name: string): boolean;
    function addComponent(com: IComponent): void;
    function getComponent(name: string): IComponent;
    function loadComponent<T>(ele: HTMLElement, vm: VM<T>): void;
}
declare namespace Pandyle {
    class Inputs {
        private _data;
        private _relations;
        private _root;
        callBack: (name: string, value: any) => void;
        constructor(element: JQuery<HTMLElement>);
        data(): any;
        set(data: any): void;
        refresh(): void;
        private initData();
        private initData_input(element, name, value);
        private initData_radio(element, name, value);
        private initData_check(element, name, value);
        private initData_normal(element, name, value);
        private initData_select(element, name, value);
        private bindChange();
        private onChange_normal(element, name, value);
        private onChange_input(element, name, value);
        private onChange_radio(element, name, value);
        private onChange_check(element, name, value);
        private onChange_select(element, name, value);
        private initName(name);
        private getDataByName(name);
        private setData(name, value);
        private updateDom(element, value);
        private updateDom_input(element, value);
        private updateDom_radio(element, value);
        private updateDom_check(element, value);
        private updateDom_normal(element, value);
        private updateDom_select(element, value);
    }
}
interface IRelation {
    property: string;
    elements: JQuery<HTMLElement>[];
}
interface IRelationCollection {
    setRelation: (property: string, element: JQuery<HTMLElement>, parentProperty: string) => void;
    findSelf: (key: string) => IRelation[];
    findSelfOrChild: (key: string) => IRelation[];
    removeChildren: (key: string) => void;
}
declare namespace Pandyle {
    class RelationCollection<T> implements IRelationCollection {
        private _util;
        private _relations;
        private constructor();
        static CreateRelationCollection<T>(util: Util<T>): RelationCollection<T>;
        setRelation(property: string, element: JQuery<HTMLElement>, parentProperty: string): void;
        findSelf(key: string): IRelation[];
        findSelfOrChild(key: string): IRelation[];
        removeChildren(key: string): void;
    }
}
declare namespace Pandyle {
    class VM<T> {
        protected _data: T;
        private _root;
        _methods: object;
        private _variables;
        private _defaultAlias;
        _relationCollection: IRelationCollection;
        private _util;
        private _renderer;
        constructor(element: JQuery<HTMLElement>, data: T, autoRun?: boolean);
        set(newData: string, value: any): any;
        set(newData: object): any;
        get(param?: any): any;
        append(arrayName: string, value: any): void;
        appendArray(arrayName: string, value: any[]): void;
        run(): void;
        render(element: JQuery<HTMLElement>, data?: any, parentProperty?: string, alias?: any): void;
        getMethod(name: string): Function;
        transfer(method: string, data: any[]): any;
        register(name: string, value: any): void;
        private updateDataAndGetElementToRerender(_newData);
        private getTargetData(key);
        private getDataByKey(key);
        private getLastProperty(key);
    }
}
declare namespace Pandyle {
    class Util<T> {
        vm: VM<T>;
        private constructor();
        static CreateUtil<T>(vm: VM<T>): Util<T>;
        getValue(element: JQuery<HTMLElement>, property: string, data: any): any;
        calcuExpression(property: string, element: JQuery<HTMLElement>, data: any): any;
        calcu(property: string, element: JQuery<HTMLElement>, data: any): any;
        convertFromPattern(element: JQuery<HTMLElement>, prop: string, pattern: string, data: object, parentProperty: any): string;
        toDefault(type: string): {};
        setAlias(element: JQuery<HTMLElement>, property: string, data?: any): void;
        getAliasData(element: JQuery<HTMLElement>, alias: string): any;
        getAliasProperty(element: JQuery<HTMLElement>, alias: string): string;
        dividePipe(expression: string): {
            property: string;
            method: string;
        };
        convert(method: string, data: any): any;
        isSelfOrChild(property: string, subProperty: string): boolean;
        isChild(property: string, subProperty: string): boolean;
        transfer(method: string, data: any[]): any;
        setRelation(property: string, element: JQuery<HTMLElement>, parentProperty: string): void;
    }
}
interface IPipeContext {
    element: HTMLElement;
    parentProperty: string;
}
declare namespace Pandyle {
    abstract class DirectiveBase<T> {
        protected _next: DirectiveBase<T>;
        protected _util: Util<T>;
        protected _context: IPipeContext;
        abstract execute(): void;
        protected next(): void;
        protected deep(): void;
        protected error(directiveName: string, errorMessage: string, domData: IDomData): void;
        append(next: DirectiveBase<T>): void;
        init(context: IPipeContext, util: Util<T>): void;
    }
}
interface IDomData {
    context?: any;
    binding?: IBinding;
    pattern?: string;
    children?: JQuery<HTMLElement>;
    parent?: JQuery<HTMLElement>;
    parentProperty?: string;
    oparentProperty?: string;
    alias?: IAlias;
    pIndex?: number;
    ocontext?: any;
    componentName?: string;
    afterRender: () => void;
}
interface IBinding {
    [key: string]: {
        pattern: string;
        related: boolean;
    };
}
interface IAlias {
    [key: string]: {
        data: any;
        property: string;
    };
}
declare namespace Pandyle {
    class PBindDirective<T> extends DirectiveBase<T> {
        execute(): void;
    }
}
declare namespace Pandyle {
    class pComDirective<T> extends DirectiveBase<T> {
        execute(): void;
    }
}
declare namespace Pandyle {
    class pTextDirective<T> extends DirectiveBase<T> {
        execute(): void;
    }
}
declare namespace Pandyle {
    class PIfDirective<T> extends DirectiveBase<T> {
        execute(): void;
    }
}
declare namespace Pandyle {
    abstract class iteratorBase<T> extends DirectiveBase<T> {
        protected _directiveName: string;
        protected _directiveBinding: string;
        execute(): void;
        abstract addChildren(element: JQuery<HTMLElement>, targetArray: any[], fullProp: string): void;
        static generateChild(domData: IDomData, index: number, value: any, fullProp: string): JQuery<HTMLElement>;
    }
}
declare namespace Pandyle {
    class PEachDirective<T> extends iteratorBase<T> {
        constructor();
        addChildren(element: JQuery<HTMLElement>, targetArray: any[], fullProp: string): void;
    }
}
declare namespace Pandyle {
    class PForDirective<T> extends iteratorBase<T> {
        constructor();
        addChildren(element: JQuery<HTMLElement>, targetArray: any[], fullProp: string): void;
    }
}
declare namespace Pandyle {
    class PContextDirective<T> extends DirectiveBase<T> {
        execute(): void;
    }
}
declare namespace Pandyle {
    class POnDirective<T> extends DirectiveBase<T> {
        execute(): void;
    }
}
declare namespace Pandyle {
    class PipeLine<T> {
        private _firstDirective;
        private _lastDirective;
        private _util;
        private constructor();
        private add(directive);
        start(context: IPipeContext): void;
        static createPipeLine<T>(util: Util<T>): PipeLine<T>;
    }
}
declare namespace Pandyle {
    class Renderer<T> {
        private _util;
        private _pipeline;
        constructor(vm: VM<T>);
        renderSingle(ele: HTMLElement, data: any, parentProperty: string, alias?: any): void;
        renderChild(ele: HTMLElement, data: any, parentProperty: string): void;
        renderPipe(ele: HTMLElement, parentProperty: string): void;
    }
}
