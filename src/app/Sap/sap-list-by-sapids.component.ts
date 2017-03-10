import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { SapService } from './../Shared/Services/sap.service'


@Component(
    {
        selector: 'gg-sap-by-sapids-list',
        templateUrl: './sap-list-by-sapids.component.html'
    }
)
export class SapListBySapIdsComponent implements OnInit {
    @Input() sapIdList: any[];
    @Input() state;
    @Input() path: string= 'saps'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }


    constructor(private sapService: SapService) {
    }

    private sapsObservable: Observable<any>

    ngOnInit(): void {
        this.stateInit();
        this.sapsObservable=  this.sapService.getSapItemsObservableBySapIdList(this.sapIdList)
    }

    ngOnDestroy(): void {
   }

}