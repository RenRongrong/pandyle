interface IRelationCollection{
    setRelation: (property: string, element: JQuery<HTMLElement>, parentProperty:string) => void;
    findSelfOrChild: (key:string) => IRelation[];
    removeChildren: (key:string) => void;
}