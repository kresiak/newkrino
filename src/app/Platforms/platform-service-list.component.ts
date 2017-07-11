import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-service-list',
        templateUrl: './platform-service-list.component.html'
    }
)
export class PlatformServiceListComponent implements OnInit {
    searchForm: FormGroup;
    searchControl = new FormControl();

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
            this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });        
}

    @Input() servicesObservable: Observable<any>
    @Input() serviceToCompareToId: string= undefined
    @Input() isForSelection: boolean = false
    @Input() selectedServiceIds: string[]= []

    @Output() servicesSelected = new EventEmitter();



    private nbHitsShown: number= 10
    private nbHitsIncrement: number= 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number>= new BehaviorSubject<number>(this.nbHitsShown)    

    private isPageRunning: boolean = true

    private servicesList: any

    private fnGetCostByService = (id) => 0 // this is a function

    private state

    private clientListObservable
    private categoryIdObservable

    private cloneForm: FormGroup    

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    ngOnInit(): void {
        this.stateInit()
        this.selectedServiceIdsMap= new Set(this.selectedServiceIds)        

        Observable.combineLatest(this.servicesObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (services, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' ) return services
            return services.filter(s => {
                return (s.data.description || '').toUpperCase().includes(txt) || (s.data.name || '').toUpperCase().includes(txt) || (s.annotation.category || '').toUpperCase().includes(txt)
            })
        }).do(services => {
            this.nbHits= services.length
        })
        .switchMap(services => {
            return this.nbHitsShownObservable.map(nbItems => {
                return services.slice(0, nbItems)
            })
        }).takeWhile(() => this.isPageRunning).subscribe(services => {
            if (!comparatorsUtils.softCopy(this.servicesList, services))
                this.servicesList = comparatorsUtils.clone(services)
            this.state.selectedTabId = 'tabListOfServices'
        })

        this.platformService.getServicesCostInfo().takeWhile(() => this.isPageRunning).subscribe(serviceCostMap => {
            this.fnGetCostByService = (serviceId) => serviceCostMap.has(serviceId) ? serviceCostMap.get(serviceId) : 0
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

    private selectedServiceIdsMap: Set<string>

    serviceSelectedInList(event, service, isSelected: boolean) {
        event.preventDefault()
        event.stopPropagation()
        var id=(service.data || {})._id
        if (isSelected && this.selectedServiceIdsMap.has(id)) this.selectedServiceIdsMap.delete(id)
        if (!isSelected && !this.selectedServiceIdsMap.has(id)) this.selectedServiceIdsMap.add(id)
        this.servicesSelected.next(Array.from(this.selectedServiceIdsMap.values()))
    }

    isServiceSelected(service) {
        return this.selectedServiceIdsMap.has(service.data._id)
    }

}