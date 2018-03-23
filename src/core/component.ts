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
        let path = Pandyle._config.comPath || '/components/';
        let name = $(ele).attr('p-com');
        if (hasComponent(name)) {
            $(ele).html(getComponent(name));
        } else {
            let url = '';
            if (/.*\.html$/.test(name)) {
                url = name;
            } else {
                url = path + name + '.html';
            }
            $.ajax({
                url: url,
                dataType: 'html',
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
                let style = $('<style></style>').html($1);
                $('head').append(style);
                return '';
            });
            addComponent({
                name: name,
                html: text
            });
            $(ele).html(text);
        }
    }
}