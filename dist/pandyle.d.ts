/// <reference types="jquery" />
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
}
declare namespace Pandyle {
    interface component {
        name: string;
        html: string;
    }
    function hasComponent(name: string): boolean;
    function addComponent(com: component): void;
    function getComponent(name: string): any;
    function loadComponent(ele: HTMLElement): void;
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
    findSelfOrChild: (key: string) => IRelation[];
    removeChildren: (key: string) => void;
}
declare namespace Pandyle {
    class relationCollection<T> implements IRelationCollection {
        private _util;
        private _relations;
        private constructor(util);
        static CreateRelationCollection<T>(util: Util<T>): relationCollection<T>;
        setRelation(property: string, element: JQuery<HTMLElement>, parentProperty: string): void;
        findSelfOrChild(key: string): IRelation[];
        removeChildren(key: string): void;
    }
}
declare namespace Pandyle {
    class VM<T> {
        protected _data: T;
        private _root;
        private _methods;
        private _filters;
        _converters: object;
        private _variables;
        private _defaultAlias;
        private _relationCollection;
        private _util;
        private static _uid;
        constructor(element: JQuery<HTMLElement>, data: T, autoRun?: boolean);
        set(newData: string, value: any): any;
        set(newData: object): any;
        get(param?: any): any;
        run(): void;
        render(element: JQuery<HTMLElement>, data?: any, parentProperty?: string, alias?: any): void;
        private renderSingle(ele, data, parentProperty, alias?);
        private bindAttr(ele, parentProperty);
        private bindIf(ele, parentProperty);
        private renderContext(ele, parentProperty);
        private renderChild(ele, data, parentProperty);
        private renderEach(element, data, parentProperty);
        private renderFor(element, data, parentProperty);
        private renderText(element, parentProperty);
        private convertFromPattern(element, prop, pattern, data, parentProperty);
        getMethod(name: string): Function;
        filter(method: string, data: any[]): any;
        register(name: string, value: any): void;
    }
}
declare namespace Pandyle {
    class Util<T> {
        private _vm;
        private constructor(vm);
        static CreateUtil<T>(vm: VM<T>): Util<T>;
        getValue(element: JQuery<HTMLElement>, property: string, data: any): any;
        calcu(property: string, element: JQuery<HTMLElement>, data: any): any;
        toDefault(type: string): {};
        setAlias(element: JQuery<HTMLElement>, property: string, data?: any): void;
        getAliasData(element: JQuery<HTMLElement>, alias: string): any;
        getAliasProperty(element: JQuery<HTMLElement>, alias: string): any;
        dividePipe(expression: string): {
            property: string;
            method: string;
        };
        convert(method: string, data: any): any;
        isSelfOrChild(property: string, subProperty: string): boolean;
        isChild(property: string, subProperty: string): boolean;
    }
}
