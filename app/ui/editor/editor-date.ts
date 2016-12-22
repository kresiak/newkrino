import { Component, Input, Output, OnInit, OnChanges, ViewEncapsulation, EventEmitter, HostBinding } from '@angular/core';
import * as moment from "moment"

@Component({
    moduleId: module.id,
    selector: 'gg-editor-date',
    host: {
        'class': 'editor'
    },
    templateUrl: './editor-date.html',
    encapsulation: ViewEncapsulation.None
})
export class EditorDate implements OnInit, OnChanges {
    @Input() content;
    @Input() @HostBinding('class.editor--edit-mode') editMode = false;
    @Output() editSaved = new EventEmitter();

    private contentEdited;    
    private savedContentEdited;

    toDatePickerDateObject(date: string): Object {
        var md;
        if (!date || date.trim()===''){
            this.content= 'Choose a date'            
            md= moment()
        } 
        else {
            md = moment(date, 'DD/MM/YYYY hh:mm:ss')
        }

        var obj = { year: md.year(), month: md.month() + 1, day: md.date() };
        return obj;
    }

    fromDatePickerDateObjec(obj: any): string {
        var md = moment()
        md.date(obj.day)
        md.month(obj.month - 1)
        md.year(obj.year)

        return md.format('DD/MM/YYYY hh:mm:ss');       
    }

    emptyContent() {
        this.contentEdited= this.toDatePickerDateObject('')
    }

    ngOnInit(): void {
        this.contentEdited = this.toDatePickerDateObject(this.content)
    }

    ngOnChanges(changes) {
        if (changes.content)
        {
            this.contentEdited = this.toDatePickerDateObject(this.content)
        }
    } 

    save() {
        this.content = this.fromDatePickerDateObjec(this.contentEdited);
        this.editSaved.next(this.content);
        this.editMode = false;
    }

    cancel() {
        this.contentEdited = this.savedContentEdited;
        this.editMode = false;
    }

    edit() {
        this.savedContentEdited= this.contentEdited;
        this.editMode = true;
    }

}
