interface IDomData{
    context?: any,
    binding?: IBinding,
    pattern?: string,
    children?: JQuery<HTMLElement>,
    parent?: JQuery<HTMLElement>,
    parentProperty?: string,
    oparentProperty?: string,
    alias?: IAlias,
    pIndex?: number
}

interface IBinding{
    [key:string] : {
        pattern: string,
        related: boolean
    }
}

interface IAlias{
    [key:string] : {
        data: any,
        property: string
    }
}
