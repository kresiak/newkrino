import { Component, Input, Output, OnInit, OnChanges, ViewEncapsulation, EventEmitter, HostBinding } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DomSanitizer, SafeHtml } from "@angular/platform-browser"
import { SelectableData } from '../../Shared/Classes/selectable-data'

@Component({
    //moduleId: module.id,
    selector: 'gg-editor-autocomplete-text',
    host: {
        'class': 'editor'
    },
    templateUrl: './editor-autocomplete-text.html',
    encapsulation: ViewEncapsulation.None
})
export class EditorAutocompleteText implements OnInit {
    constructor(private _sanitizer: DomSanitizer) {

    }
    @Input() readOnly: boolean = false;
    @Input() selectableData: string[];
    @Input() selectedText: string
    @Input() emptyContentText: string = ''

    @Input() @HostBinding('class.editor--edit-mode') editMode = false;
    @Output() textChanged = new EventEmitter();

    private content;
    private selectedItem;

    ngOnInit(): void {
        this.content = this.selectedText || this.emptyContentText
    }

    save() {
        this.textChanged.next(this.selectedItem)
        this.content = this.selectedItem
        this.editMode = false
    }

    cancel() {
        this.editMode = false;
    }

    edit() {
        this.selectedItem= this.content
        this.editMode = true;
    }

    /*   autocompleListFormatter = (data: SelectableData): SafeHtml => {
           let html = `<span>${data.name}</span>`;
           return this._sanitizer.bypassSecurityTrustHtml(html);
       }
   */

}
