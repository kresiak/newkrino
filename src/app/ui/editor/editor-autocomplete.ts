import { Component, Input, Output, OnInit, OnChanges, ViewEncapsulation, EventEmitter, HostBinding } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"
import { SelectableData } from '../../Shared/Classes/selectable-data'

@Component({
    //moduleId: module.id,
    selector: 'gg-editor-autocomplete',
    host: {
        'class': 'editor'
    },
    templateUrl: './editor-autocomplete.html',
    encapsulation: ViewEncapsulation.None
})
export class EditorAutocomplete implements OnInit {
    constructor(private _sanitizer: DomSanitizer) {

    }
    @Input() readOnly: boolean= false;
    @Input() selectableData: Observable<SelectableData[]>;
    @Input() selectedId: string
    @Input() emptyContentText: string = ''
    
    @Input() @HostBinding('class.editor--edit-mode') editMode = false;
    @Output() idChanged = new EventEmitter();

    private content;    
    private selectedItem;

    private initContent(selectedId: Observable<string>): void {
        this.selectableData.combineLatest(selectedId, (sdata, id) => {            
            var selectedItem = sdata && id ? sdata.filter(item => id === item.id)[0] : undefined;
            return selectedItem  
        }).subscribe(item => {
            this.selectedItem= item
            this.content = item ? item.name : this.emptyContentText
        });
    }


    ngOnInit(): void {
        this.initContent(Observable.from([this.selectedId]))
    }

    save() {
        this.idChanged.next(this.selectedItem.id)
        this.initContent( Observable.from([this.selectedItem.id]) )
        this.editMode = false
    }

    cancel() {
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    autocompleListFormatter = (data: SelectableData): SafeHtml => {
        let html = `<span>${data.name}</span>`;
        return this._sanitizer.bypassSecurityTrustHtml(html);
    }


}
