interface IRelationCollection{
    setRelation: (property: string, element: JQuery<HTMLElement>, parentProperty:string) => void;
    findSelf: (key:string) => IRelation[];
    findSelfOrChild: (key:string) => IRelation[];
    removeChildren: (key:string) => void;
}