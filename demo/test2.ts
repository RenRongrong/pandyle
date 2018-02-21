///<reference path="../src/core/vm.ts" />
interface book{
    id:number,
    title:string,
    author:{
        name: string,
        nation: string,
        honors: string[]
    }
    price:number,
    tags:string[]
}

let vm:myVM;
let uid = '103';
$(document).ready(function () {
    vm = new myVM($('.temp'), {
        id: 2,
        title: '百年孤独',
        author: {
            name: '马尔克斯',
            nation: '哥伦比亚',
            honors: ['作家', '文学家']
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
    vm.author = vm.author + '1';
    vm.set({
        'author.honors': ['记者', '歌手', '名人']
    });
    uid = '203';
    vm.render($('.local'));
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