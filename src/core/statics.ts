namespace Pandyle{
    
    export const _variables: object = {};
    export const _methods: object = {};
    export const _filters: object = {};
    export const _converters: object = {};
    export const _components: object = {};

    export function getMethod(name: string): Function {
        return _methods[name];
    }

    export function hasSuffix(target: string, suffix: string) {
        let reg = new RegExp('/^\w+' + suffix + '$/');
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
}