export class SelectorData
{
    id: string;
    name: string;
    selected: boolean;
    private savedSelect: boolean;

    constructor(id: string, name: string, selected: boolean)
    {
        this.id= id;
        this.name= name;
        this.selected= selected;
    };

    savePresentState(): void
    {
        this.savedSelect= this.selected;
    }

    restoreFromSavedState(): void
    {
        this.selected= this.savedSelect;
    }
}