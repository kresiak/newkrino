import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-snapshots',
        templateUrl: './platform-service-snapshots.component.html'
    }
)
export class PlatformServiceSnapshotsComponent implements OnInit {
    constructor(private dataStore: DataStore, private platformService: PlatformService) {
    }

    @Input() serviceId: string

    private snapshotsList: any
    private isPageRunning: boolean = true

    private state

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    private fnGetCostByService = (id) => 0 // this is a function

    ngOnInit(): void {
        this.stateInit()

        this.dataStore.getDataObservable('platform.service.snapshots').map(snapshots => snapshots.filter(s => s.serviceId===this.serviceId)).takeWhile(() => this.isPageRunning).subscribe(services => {
            if (!comparatorsUtils.softCopy(this.snapshotsList, services))
                this.snapshotsList = comparatorsUtils.clone(services)
        })

        this.platformService.getSnapshotpsCostInfo().takeWhile(() => this.isPageRunning).subscribe(serviceCostMap => {
            this.fnGetCostByService= (serviceId) => serviceCostMap.has(serviceId) ? serviceCostMap.get(serviceId) : 0
        })

    }


    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
        }
    };


    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}