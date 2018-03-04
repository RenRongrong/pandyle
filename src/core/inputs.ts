/// <reference path="statics.ts" />

namespace Pandyle{
    export class Inputs{
        private _data:any;
        private _relations: relation[];

        constructor(element: JQuery<HTMLElement>){
            this._data = {};
            this.initData(element);
            this.bindChange(element);
        }

        public get data(){
            return $.extend({}, this._data);
        }

        private initData(element: JQuery<HTMLElement>) {
            element.find('input,textarea,select').each((index, ele) => {
                let name = $(ele).prop('name');
                if (!this._data[name]) {
                    this._data[name] = $(ele).val();
                }
            });
        }

        private bindChange(element:JQuery<HTMLElement>){
            element.on('change', 'input,textarea,select', e => {
                let ele = $(e.currentTarget);
                let name = ele.prop('name');
                let value = ele.val();
                this._data[name] = value;
            })
        }
    }
}