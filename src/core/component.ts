/// <reference path="statics.ts" />
namespace Pandyle {
    export interface component {
        name: string,
        html: string
    }

    export function hasComponent(name: string) {
        return typeof _components[name] !== 'undefined';
    }

    export function addComponent(com: component) {
        _components[com.name] = com.html;
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
            element.html(getComponent(name));
            let children = element.children();
            children.each((index, item) => {
                $(item).data('context', element.data('context'));
            })
            element.data('children', children);
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
            text = text.replace(/<\s*script\s*>((?:.|\r|\n)*?)<\/script\s*>/g, ($0, $1) => {
                (new Function($1))();
                return '';
            });
            text = text.replace(/<\s*style\s*>((?:.|\r|\n)*?)<\/style\s*>/g, ($0, $1) => {
                let style = '<style>' + $1 + '</style>';
                $('head').append(style);
                return '';
            });
            addComponent({
                name: name,
                html: text
            });
            element.html(text);
            let children = element.children();
            children.each((index, item) => {
                $(item).data('context', element.data('context'));
            })
            element.data('children', children);
        }
    }
}