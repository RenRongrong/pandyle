namespace Pandyle{

    interface relation{
        property: string;
        elements: JQuery<HTMLElement>[];
    }

    export class VM{
        private _data: any;
        private _relations: relation[];
        private _root: JQuery<HTMLElement>;

        constructor(element:JQuery<HTMLElement>, data:any){
            this._data = data;
            this._root = element;
            this.init();
        }

        private init(){
            this.setBind(this._root, this._data);
        }

        private setBind(element:JQuery<HTMLElement>, data:any){
            if(element.children().length > 0){
                for(var i=0; i<element.children().length; i++){
                    var child = $(element.children()[i]);
                    child.data('context', data);
                    this.setBind(child, data);
                }
            }else{
                var reg = /{{\s*(\w+\.?)+\s*}}/g;
                var result = element.text().replace(reg, function($0, $1){
                    return data[$1];
                })
                element.text(result);
            }
        }
    }
}