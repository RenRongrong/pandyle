/// <reference path="statics.ts" />
namespace Pandyle {
    export interface component {
        name: string,
        html: string,
        onLoad?: ()=>void
    }

    export function hasComponent(name: string) {
        return typeof _components[name] !== 'undefined';
    }

    export function addComponent(com: component) {
        _components[com.name] = com;
    }

    export function getComponent(name: string) {
        return _components[name];
    }

    export function loadComponent(ele: HTMLElement) {
        let element = $(ele);
        element.children().remove();
        let name = element.attr('p-com');
        name = $.trim(name);
        if (hasComponent(name)) {
            let com = getComponent(name);
            element.html(com.html);
            let children = element.children();
            children.each((index, item) => {
                $(item).data('context', element.data('context'));
            })
            element.data('children', children);
            if(com.onLoad){
                com.onLoad();
            }
        } else {
            let url = '';
            if (/^@.*/.test(name)) {
                url = name.replace(/^@/, '');
            } else {
                let fullpath = name.split('.');
                let path = Pandyle._config.comPath
                    ? Pandyle._config.comPath['Default'] || './components/{name}.html'
                    : './components/{name}.html';
                if (fullpath.length > 1) {
                    path = Pandyle._config.comPath[fullpath[0]];
                    url = path.replace(/{.*}/g, fullpath[1]);
                } else {
                    url = path.replace(/{.*}/g, name);
                }
            }
            $.ajax({
                url: url,
                async: false,
                success: res => {
                    insertToDom(res, name);
                }
            })
        }

        function insertToDom(text: string, name: string) {
            let component:component = {name: name, html: ''};
            text = text.replace(/<\s*script\s*>((?:.|\r|\n)*?)<\/script\s*>/g, ($0, $1) => {
                (new Function($1))();
                return '';
            });
            text = text.replace(/<\s*style\s*>((?:.|\r|\n)*?)<\/style\s*>/g, ($0, $1) => {
                let style = '<style>' + $1 + '</style>';
                $('head').append(style);
                return '';
            });
            text = text.replace(/<\s*script\s*>((?:.|\r|\n)*?)<\/script\s*>/g, ($0, $1) => {
                new Function($1).call(component);
                return '';
            });
            component.html = text;
            addComponent(component);
            element.html(text);
            let children = element.children();
            children.each((index, item) => {
                $(item).data('context', element.data('context'));
            })
            element.data('children', children);
            if(component.onLoad){
                component.onLoad();
            }
        }
    }
}