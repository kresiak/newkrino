import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        selector: 'gg-sap-list',
        templateUrl: './sap-list.component.html'
    }
)
export class SapListComponent implements OnInit {
    @Input() sapsObservable: Observable<any>;
    @Input() state;
    @Input() path: string= 'saps'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionSaps: Subscription 

    private saps;

    constructor() {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionSaps= Observable.combineLatest(this.sapsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (saps, searchTxt: string) => {
            if (searchTxt.trim() === '') return saps.slice(0, 200)
            return saps.filter(sap => sap.mainData.data.sapId.toString().toUpperCase().includes(searchTxt.toUpperCase())
                || sap.mainData.data.supplier.toUpperCase().includes(searchTxt.toUpperCase())).slice(0, 200);
        }).subscribe(saps => this.saps = saps);
    }

    ngOnDestroy(): void {
         this.subscriptionSaps.unsubscribe()
   }

    getSapObservable(sapId: number) {
        return this.sapsObservable.map(saps => saps.filter(sap => sap.mainData.data.sapId === sapId)[0]);
    }

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }

    private getOtpText(sapInfo) {
        var arr=  Array.from(sapInfo.mainData.annotation.otpMap.keys())
        return arr.length === 0 ? 'no OTP' : arr.reduce((a, b) => a + ', ' + b)
    }

}