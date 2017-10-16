import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { PlatformService } from './../Shared/Services/platform.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-snapshot-list',
        templateUrl: './platform-service-snapshot-list.component.html'
    }
)
export class PlatformServiceSnapshotListComponent implements OnInit {

    constructor(private platformService: PlatformService) {
    }

    @Input() observableSnapshots: Observable<any>
    private snapshotsList: any
    private isPageRunning: boolean = true

    private state

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    private fnGetCostByService = (id) => 0 // this is a function

    fnFilter(s, txt) {
        if (txt === '' ) return true
        return (s.description || '').toUpperCase().includes(txt) || (s.version || '').toUpperCase().includes(txt)
    }

    setSnapshots(services) {
        this.snapshotsList= services
        this.state.selectedTabId = 'tabListOfServices'
    }

    ngOnInit(): void {
        this.stateInit()

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