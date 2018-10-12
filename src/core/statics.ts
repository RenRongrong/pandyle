namespace Pandyle{
    
    export const _variables: any = {};
    export const _methods: any = {};
    export const _filters: any = {};
    export const _converters: any = {};
    export const _components: any = {};
    export const _config: any = {};

    export var $:JQueryStatic;

    export function getMethod(name: string): Function {
        return _methods[name];
    }

    export function hasSuffix(target: string, suffix: string) {
        let reg = new RegExp('^\\w+' + suffix + '$');
        return reg.test(target);
    }

    

    export function register(name: string, value: any) {
        if ($.isFunction(value)) {
            if (hasSuffix(name, 'Filter')) {
                _filters[name] = value;
            } else if (hasSuffix(name, 'Converter')) {
                _converters[name] = value;
            } else {
                _methods[name] = value;
            }
        } else {
            _variables[name] = value;
        }
    }

    export interface relation {
        property: string;
        elements: JQuery<HTMLElement>[];
    }

    export function config(options:JSON){
        for(let item in options){
            _config[item] = options[item];
        }
    }


}