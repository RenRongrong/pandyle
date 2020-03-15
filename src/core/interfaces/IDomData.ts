interface IDomData{
    context?: any,
    binding?: IBinding,
    pattern?: string,
    children?: JQuery<HTMLElement>,
    parent?: JQuery<HTMLElement>,
    alias?: IAlias,
    pIndex?: number,
    ocontext?: any,
    componentName?: string,
    afterRender: () => void
}

interface IBinding{
    [key:string] : {
        pattern: string
    }
}

interface IAlias{
    [key:string] : {
        data: any
    }
}
