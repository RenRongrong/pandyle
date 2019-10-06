/// <reference path="statics.ts" />
namespace Pandyle {
    export class Component implements IComponent {
        public readonly name: string;
        public html: string;
        public onLoad: <T>(context: any, root: HTMLElement, vm:VM<T>) => void;
        private setPrivateData(element: JQuery<HTMLElement>, data: any) {
            Pandyle.getDomData(element).alias.private = {
                data: data,
                property: '@private'
            }
        }

        private afterRender(element:JQuery<HTMLElement>, handler: ()=>void){
            Pandyle.getDomData(element).afterRender = handler;
        }

        private getPrivateData(root: JQuery<HTMLElement>){
            return Pandyle.getDomData(root).alias.private.data;
        }

        public constructor(name:string, html:string){
            this.name = name;
            this.html = html;
        }
    }
    export interface IComponent {
        name: string,
        html: string,
        onLoad?: <T>(context: any, root: HTMLElement, vm:VM<T>) => void
    }

    export function hasComponent(name: string) {
        return typeof _components[name] !== 'undefined';
    }

    export function addComponent(com: IComponent) {
        _components[com.name] = com;
    }

    export function getComponent(name: string): IComponent {
        return _components[name];
    }

    export function loadComponent<T>(ele: HTMLElement, vm:VM<T>) {
        let element = $(ele);
        let name = element.attr('p-com');
        let domData = Pandyle.getDomData(element);
        if (name === domData.componentName) {
            return;
        } else {
            domData.componentName = name;
        }
        element.children().remove();
        let context = domData.context;
        name = $.trim(name);
        if (hasComponent(name)) {
            let com = getComponent(name);
            element.html(com.html);
            let children = element.children();
            children.each((index, item) => {
                let childrenDomData = Pandyle.getDomData($(item));
                childrenDomData.context = context;
            })
            domData.children = children;
            if (com.onLoad) {
                com.onLoad(context, ele, vm);
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
                    insertToDom(res, name, context, ele, vm);
                }
            })
        }

        function insertToDom<T>(text: string, name: string, context: any, root: HTMLElement, vm:VM<T>) {
            let component = new Component(name, text);
            text = text.replace(/<\s*style\s*>((?:.|\r|\n)*?)<\/style\s*>/g, ($0, $1) => {
                //let style = '<style>' + $1 + '</style>';
                $('head').append($0);
                return '';
            });
            text = text.replace(/<\s*link.*href\s*\=\s*["'](.*)["'].*>/g, ($0, $1) => {
                if($('head link[href="' + $1 + '"]').length === 0){
                    $('head').append($0);
                }
                return '';
            });
            text = text.replace(/<\s*script.*src\s*\=\s*["'](.*)["'].*><\/script\s*>/g, ($0, $1) => {
                if($('head script[src="' + $1 + '"]').length === 0){
                    $('head').append($0);
                }
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
                Pandyle.getDomData($(item)).context = context;
            })
            Pandyle.getDomData(element).children = children;
            if (component.onLoad) {
                component.onLoad(context, root, vm);
            }
        }
    }
}