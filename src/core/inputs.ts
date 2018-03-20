/// <reference path="statics.ts" />

namespace Pandyle {
    export class Inputs {
        private _data: any;
        private _relations: relation[];
        private _root:JQuery<HTMLElement>;

        constructor(element: JQuery<HTMLElement>) {
            this._data = {};
            this._root = element;
            this.initData();
            this.bindChange();
        }

        public get data() {
            return $.extend({}, this._data);
        }

        public set(data:any){
            for(let key in data){
                this.setData(key, data[key]);
                let elements = this._root.find('[name="' + key + '"]');
                this.updateDom(elements, data[key]);
                elements.trigger('modelChange', data[key]);
            }
        }

        private initData() {
            this._root.find('input,textarea,select').each((index, ele) => {
                let target = $(ele);
                let tag = target.prop('tagName');
                let name = target.prop('name');
                this.initName(name);
                switch(tag){
                    case 'INPUT':
                        this.initData_input(target);
                        break;
                    case 'TEXTAREA':
                        this.initData_normal(target);
                        break;
                    case 'SELECT':
                        this.initData_select(target);
                        break;
                    default:
                        break;
                }
            });
        }

        private initData_input(element: JQuery<HTMLElement>){
            let type = element.prop('type');
            switch(type){
                case 'radio':
                    this.initData_radio(element);
                    break;
                case 'checkbox':
                    this.initData_check(element);
                    break;
                default:
                    this.initData_normal(element);
                    break;
            }
        }

        private initData_radio(element:JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val();
            if($.isEmptyObject(this.getDataByName(name))){
                this.setData(name, '');
            }
            if(element.prop('checked')){
                this.setData(name, value);
            }
        }

        private initData_check(element: JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val();
            if($.isEmptyObject(this.getDataByName(name))){
                this.setData(name, []);
            }
            if(element.prop('checked')){
                this.getDataByName(name).push(value);
            }
        }

        private initData_normal(element:JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val();
            this.setData(name, value);
        }

        private initData_select(element:JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val() || '';
            this.setData(name, value);
        }

        private bindChange() {
            this._root.on('change', 'input,textarea,select', e => {
                let ele = $(e.currentTarget);
                let tagName = ele.prop('tagName');
                switch (tagName) {
                    case 'INPUT':
                        this.onChange_input(ele);
                        break;
                    case 'TEXTAREA':
                        this.onChange_normal(ele);
                        break;
                    case 'SELECT':
                        this.onChange_select(ele);
                        break;
                }
            })
        }

        private onChange_normal(element: JQuery<HTMLElement>) {
            let name = element.prop('name');
            let value = element.val();
            this.setData(name, value);
        }

        private onChange_input(element: JQuery<HTMLElement>) {
            switch (element.prop('type')) {
                case 'radio':
                    this.onChange_radio(element);
                    break;
                case 'checkbox':
                    this.onChange_check(element);
                    break;
                default:
                    this.onChange_normal(element);
                    break;
            }
        }

        private onChange_radio(element: JQuery<HTMLElement>) {
            let name = element.prop('name');
            let value = element.val();
            if (element.prop('checked')) {
                this.setData(name, value);
            }
        }

        private onChange_check(element: JQuery<HTMLElement>) {
            let name = element.prop('name');
            let value = element.val();
            if (element.prop('checked')) {
                this.getDataByName(name).push(value);
            } else {
                let index = this.getDataByName(name).indexOf(value);
                this.getDataByName(name).splice(index, 1);
            }
        }

        private onChange_select(element:JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val();
            this.setData(name, value);
        }

        private initName(name:string) {
            name.split('.').reduce((obj, current) => {
                if(obj[current]){
                    return obj[current];
                }else{
                    obj[current] = {};
                    return obj[current];
                }
            }, this._data);
        }

        private getDataByName(name:string){
            return name.split('.').reduce((obj, current) => {
                return obj[current];
            }, this._data);
        }

        private setData(name:string, value:any){
            let nodes = name.split('.');
            let property = nodes.pop();
            let data = nodes.reduce((obj, current) => {
                return obj[current];
            }, this._data);
            data[property] = value;
        }

        private updateDom(element:JQuery<HTMLElement>, value:any){
            let tag = element.prop('tagName');
            switch(tag){
                case 'INPUT':
                    this.updateDom_input(element, value);
                    break;
                case 'TEXTAREA':
                    this.updateDom_normal(element, value);
                    break;
                case 'SELECT':
                    this.updateDom_select(element, value);
                    break;
                default:
                    this.updateDom_normal(element, value);
            }
        }

        private updateDom_input(element:JQuery<HTMLElement>, value:any){
            let type = element.prop('type');
            switch(type){
                case 'radio':
                    this.updateDom_radio(element, value);
                    break;
                case 'checkbox':
                    this.updateDom_check(element, value);
                    break;
                default:
                    this.updateDom_normal(element, value);
                    break;
            }
        }

        private updateDom_radio(element:JQuery<HTMLElement>, value:any){
            element.each((index, ele) => {
                let target = $(ele);
                if(target.val() == value){
                    target.prop('checked', 'checked');
                }else{
                    target.removeProp('checked');
                }
            })
        }

        private updateDom_check(element:JQuery<HTMLElement>, value:any[]){
            element.each((index, ele) => {
                let target = $(ele);
                if(value.indexOf(target.val()) > -1){
                    target.prop('checked', 'checked');
                }else{
                    target.removeProp('checked');
                }
            })
        }

        private updateDom_normal(element:JQuery<HTMLElement>, value:any){
            element.val(value);
        }

        private updateDom_select(element:JQuery<HTMLElement>, value:any){
            element.val(value);
        }
    }
}