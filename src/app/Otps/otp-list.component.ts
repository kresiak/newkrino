import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { SapService } from './../Shared/Services/sap.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-otp-list',
        templateUrl: './otp-list.component.html'
    }
)
export class OtpListComponent implements OnInit {
    @Input() otpsObservable: Observable<any>;
    @Input() config;
    @Input() state;
    @Input() path: string = 'otps'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionOtps: Subscription

    private otps;

    constructor(private sapService: SapService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();

        var otpAddSapCounter = function (otp, otpSapMap) {
            otp.annotation.nbSapItems = otpSapMap.has(otp.data.name) ? otpSapMap.get(otp.data.name).sapIdSet.size : 0
            return otp
        }

        this.subscriptionOtps = Observable.combineLatest(this.otpsObservable, this.sapService.getSapOtpMapObservable(), this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''),
            (otps, otpSapMap, searchTxt: string) => {
                if (searchTxt.trim() === '') return otps.filter(otp => !otp.data.isDeleted).map(otp => otpAddSapCounter(otp, otpSapMap));
                return otps.filter(otp => otp.data.name.toUpperCase().includes(searchTxt.toUpperCase())
                    || otp.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase())).map(otp => otpAddSapCounter(otp, otpSapMap));
            }).subscribe(otps => this.otps = otps);
    }

    ngOnDestroy(): void {
        this.subscriptionOtps.unsubscribe()
    }

    getOtpObservable(id: string) {
        return this.otpsObservable.map(otps => otps.filter(otp => otp.data._id === id)[0]);
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
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

}