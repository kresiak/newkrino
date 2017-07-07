import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-snapshot-list',
        templateUrl: './platform-service-snapshot-list.component.html'
    }
)
export class PlatformServiceSnapshotListComponent implements OnInit {
    snapshotObservable: Observable<any>;
    searchForm: FormGroup;
    searchControl = new FormControl();

    constructor(private dataStore: DataStore, private platformService: PlatformService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });        
    }

    @Input() observableSnapshots: Observable<any>

    private nbHitsShown: number= 10
    private nbHitsIncrement: number= 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number>= new BehaviorSubject<number>(this.nbHitsShown)    

    private snapshotsList: any
    private snapshotsListAll: any
    private isPageRunning: boolean = true

    private state


    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    private fnGetCostByService = (id) => 0 // this is a function

    ngOnInit(): void {
        this.stateInit()

        this.snapshotObservable = Observable.combineLatest(this.observableSnapshots, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (snapshots, searchTxt: string) => {
            this.snapshotsListAll= snapshots
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' ) return snapshots
            return snapshots.filter(s => {
                return (s.description || '').toUpperCase().includes(txt) || (s.version || '').toUpperCase().includes(txt)
            })
        }).do(snapshots => {
            this.nbHits= snapshots.length
        })
        .switchMap(snapshots => {
            return this.nbHitsShownObservable.map(nbItems => {
                return snapshots.slice(0, nbItems)
            })
        });

        this.snapshotObservable.takeWhile(() => this.isPageRunning).subscribe(snapshots => {
            if (!comparatorsUtils.softCopy(this.snapshotsList, snapshots))                
                this.snapshotsList = comparatorsUtils.clone(snapshots)
            this.state.selectedTabId= 'tabListOfSnapshots'
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

    resetSerachControl() {
        this.searchControl.setValue('')
    };

    private moreHits() {
        this.nbHitsShown+= this.nbHitsIncrement
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    enableDisableSnapshot(isDisabled: boolean, snapshot) {
        delete snapshot.confirmation
        snapshot.isDisabled = isDisabled
        this.dataStore.updateData('platform.service.snapshots', snapshot._id, snapshot)
    }

}