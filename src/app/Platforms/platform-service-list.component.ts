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
        
        this.clientListObservable = this.dataStore.getDataObservable('platform.client.types').takeWhile(() => this.isPageRunning).map(machines => machines.map(machine => {
            return {
                id: machine._id,
                name: machine.name
            }
        }));
        
        this.categoryIdObservable = this.dataStore.getDataObservable('platform.service.categories').takeWhile(() => this.isPageRunning).map(categories => categories.map(categoryId => {
            return {
                id: categoryId._id,
                name: categoryId.name
            }
        }))   

        this.cloneForm = this.formBuilder.group({
            nameOfService: ['', [Validators.required, Validators.minLength(3)]],
            description: ['']
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

    nameServiceUpdated(name, serviceItem) {
        serviceItem.data.name = name
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)
    }

    descriptionServiceUpdated(description, serviceItem) {
        serviceItem.data.description = description
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)
    }

    clientTypeChanged(typeid, serviceItem) {
        serviceItem.data.clientTypeId = typeid
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)        
    }

    categoryIdInInfoChanged(catId, serviceItem) {
        serviceItem.data.categoryId = catId
        this.dataStore.updateData('platform.services', serviceItem.data._id, serviceItem.data)
    }

    cloneService(service, formValue, isValid) {
        if (!isValid) return
        this.platformService.cloneService(service.data._id, formValue.nameOfService, formValue.description).subscribe(res => {
            this.resetCloneForm()
        })
    }

    resetCloneForm() {
        this.cloneForm.reset()
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    };
   
    private moreHits() {
        this.nbHitsShown+= this.nbHitsIncrement
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

}