/// <reference path="statics.ts" />

namespace Pandyle {
    export class Inputs {
        private _data: any;
        private _relations: relation[];

        constructor(element: JQuery<HTMLElement>) {
            this._data = {};
            this.initData(element);
            this.bindChange(element);
        }

        public get data() {
            return $.extend({}, this._data);
        }

        private initData(element: JQuery<HTMLElement>) {
            element.find('input,textarea,select').each((index, ele) => {
                let target = $(ele);
                let tag = target.prop('tagName');
                switch(tag){
                    case 'INPUT':
                        this.initData_input(target);
                        break;
                    case 'TEXTAREA':
                        this.initData_normal(target);
                        break;
                    case 'SELECT':
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
            if(!this._data[name]){
                this._data[name] = '';
            }
            if(element.prop('checked')){
                this._data[name] = value;
            }
        }

        private initData_check(element: JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val();
            if(!this._data[name]){
                this._data[name] = [];
            }
            if(element.prop('checked')){
                this._data[name].push(value);
            }
        }

        private initData_normal(element:JQuery<HTMLElement>){
            let name = element.prop('name');
            let value = element.val();
            this._data[name] = value;
        }

        private bindChange(element: JQuery<HTMLElement>) {
            element.on('change', 'input,textarea,select', e => {
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
            this._data[name] = value;
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
                this._data[name] = value;
            }
        }

        private onChange_check(element: JQuery<HTMLElement>) {
            let name = element.prop('name');
            let value = element.val();
            if (element.prop('checked')) {
                this._data[name].push(value);
            } else {
                let index = this._data[name].indexOf(value);
                this._data[name].splice(index, 1);
            }
        }

        private onChange_select(element:JQuery<HTMLElement>){
            
        }
    }
}