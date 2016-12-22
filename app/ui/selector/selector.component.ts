import { SelectableData } from '../../Shared/Classes/selectable-data'

import { Component, Input, Output, ViewEncapsulation, EventEmitter, Inject, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Rx'


@Component({
    moduleId: module.id,
    selector: 'gg-selector',
    host: {
        'class': 'editor'
    },
    templateUrl: './selector.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SelectorComponent implements OnInit {
    @Input() selectableData: Observable<SelectableData[]>;
    @Input() selectedIds: Observable<string[]>;
    //@Input() nbSelectable: number = 1;

    private editMode = false;
    @Output() selectionChanged = new EventEmitter();
    @Output() selectionOptionAdded = new EventEmitter();
    private content: string;
    private pictureselectedIds: string[];
    private isDisconnectedFromData: boolean= false

    private tmp;


    constructor(private modalService: NgbModal) {
    }

    ngOnInit(): void {
        if (!this.selectedIds){
            this.selectedIds= Observable.from([[]])
            this.pictureselectedIds= []
            this.isDisconnectedFromData= true
        } 
        this.initContent(this.selectedIds);
    }

    private initContent(selectedIds: Observable<string[]>): void {
        this.selectableData.combineLatest(selectedIds, (sdata, ids) => {
            var selectedItems = sdata && ids ? sdata.filter(item => ids.includes(item.id)) : [];
            return selectedItems.length > 0 ? selectedItems.map(item => item.name).reduce((u, v) => u + ', ' + v) : 'nothing yet';
        }).subscribe(txt =>
            this.content = txt
            );
    }

    emptyContent() {
        this.selectedIds= Observable.from([[]])
        this.pictureselectedIds= []
        this.initContent(this.selectedIds)
    }

    openModal(template) {
        if (!this.isDisconnectedFromData) this.selectedIds.subscribe(ids => this.pictureselectedIds = ids ? ids.slice(0) : []);

        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then((res) => {
            this.save();
        }, (res) => {
            this.cancel();
        });
        promise.catch((err) => {
            this.cancel();
        });

        this.editMode = true;
    }

    setItemSelection(item: SelectableData, isSelected: boolean) {
        if (isSelected && !this.pictureselectedIds.includes(item.id)) {
            this.pictureselectedIds.push(item.id);
        }
        if (!isSelected && this.pictureselectedIds.includes(item.id)) {
            var pos = this.pictureselectedIds.findIndex(id => item.id === id);
            this.pictureselectedIds.splice(pos, 1);
        }
    }

    isItemSelected(item: SelectableData) {
        return this.pictureselectedIds.includes(item.id);
    }

    private save() {
        this.initContent(Observable.from([this.pictureselectedIds]));
        this.selectionChanged.next(this.pictureselectedIds);
        this.editMode = false;
    }

    private cancel() {
        this.editMode = false;
    }

    enterNewSelectableItem(newItem) {
        if (newItem.value.trim().length < 2) return;
        this.selectionOptionAdded.next(newItem.value);
        newItem.value = '';
        newItem.focus();
    }

    onKeyDown(event) {
        if (event.keyCode === 13) {
            this.enterNewSelectableItem(event.target);
        }
    } 
}
