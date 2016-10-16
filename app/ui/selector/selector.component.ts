import { SelectorData } from './selector-data'

import { Component, Input, Output, OnInit, AfterViewInit, ViewEncapsulation, EventEmitter, Inject, HostBinding, HostListener } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
    moduleId: module.id,
    selector: 'gg-selector',
    host: {
        'class': 'editor'
    },
    templateUrl: './selector.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SelectorComponent implements OnInit, AfterViewInit {
    @Input() data: [SelectorData];
    @Input() nbSelectable: number = 1;
    private editMode = false;
    @Output() editSaved = new EventEmitter();
    private content: string;

    // We use ElementRef in order to obtain our editable element for later use
    constructor(private modalService: NgbModal) {

    }

    openModal(template) {
        this.data.forEach(d => d.savePresentState());
        this.modalService.open(template);
        this.editMode = true;
    }

    ngAfterViewInit(): void {
        this.constructContent();
    }

    ngOnInit(): void {
        
    }

    // We need to make sure to reflect to our editable element if content gets updated from outside
    onChanges(changes) {
        if (changes.data) {
            this.data= changes.data;
            if (this.editMode)
            {
                this.data.forEach(d => d.savePresentState());
            }
            else
            {
                this.constructContent();
            }            
        }
    }

    constructContent() {
        var list= this.data.filter(item => item.selected).map(item => item.name);
        this.content = list && list.length > 0 ? list.reduce((u, v) => u + ', ' + v) : 'nothing yet';
    }

    // On save we reflect the content of the editable element into the content field and emit an event
    save() {
        this.constructContent();
        this.editSaved.next(this.data);
        // Setting editMode to false to switch the editor back to viewing mode
        this.editMode = false;
    }

    // Canceling the edit will not reflect the edited content and switch back to viewing mode
    cancel() {
        this.data.forEach(d => d.restoreFromSavedState());
        this.editMode = false;
    }

}
