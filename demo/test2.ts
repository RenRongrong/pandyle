interface book{
    id:number,
    title:string,
    author:{
        name: string,
        nation: string
    }
    price:number,
    tags:string[]
}

let vm:myVM;
$(document).ready(function () {
    vm = new myVM($('.temp'), {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚'
        },
        price: 89,
        tags: [
            '名著',
            '文学',
            '外国'
        ]
    })
})

function setName(){
    vm.author = 'rrr';
}

class myVM extends Pandyle.VM<book>{
    get title(){
        return this.get('title');
    }

    set title(value:string){
        this.set({
            'title': value
        })
    }

    get author(){
        return this.get('author.name');
    }
    set author(value:string){
        this.set({
            'author.name': value
        })
    }


}