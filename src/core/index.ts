(function($:any){
    $.fn.vm = function(data, autoRun=true){
        let element:JQuery<HTMLElement> = this;
        if(element.data('vm')){
            return element.data('vm');
        }else{
            let vm = new Pandyle.VM(element, data, autoRun);
            element.data('vm', vm);
            return vm;
        }
    }

    $.fn.inputs = function(){
        let element:JQuery<HTMLElement> = this;
        if(element.data('inputs')){
            return element.data('inputs');
        }else{
            let inputs = new Pandyle.Inputs(element);
            element.data('inputs', inputs);
            return inputs;
        }
    }
})(jQuery)