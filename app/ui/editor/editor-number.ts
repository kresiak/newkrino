import { Component, Input, Output, OnInit, OnChanges, ViewEncapsulation, EventEmitter, HostBinding } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'gg-editor-number',
    host: {
        'class': 'editor'
    },
    templateUrl: './editor-number.html',
    encapsulation: ViewEncapsulation.None
})
export class EditorNumber implements OnInit, OnChanges {
    @Input() content;
    @Input() minimumValue: number= 0;
    @Input() @HostBinding('class.editor--edit-mode') editMode = false;
    @Output() editSaved = new EventEmitter();

    private contentEdited;    

    ngOnInit(): void {
        this.contentEdited = this.content;
    }

    ngOnChanges(changes) {
        if (changes.content)
        {
            this.contentEdited= changes.content.currentValue;
        }
    } 

    save() {
        this.content = this.contentEdited;
        this.editSaved.next(this.content);
        this.editMode = false;
    }

    cancel() {
        this.contentEdited = this.content;
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    validate(value) {
        var v= +value ? +value : 0;        
        v < this.minimumValue ? this.contentEdited = this.minimumValue : this.contentEdited = v;
    }
}
