import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx'
import { OtpService } from '../Shared/Services/otp.service'
import { ConfigService } from './../Shared/Services/config.service'
import { SapService } from './../Shared/Services/sap.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as comparatorsUtils from './../Shared/Utils/comparators'


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

    private listName = 'otpList'
    private showSearch: boolean = false

    private otps;
    private nbHitsShown: number = 15
    private nbHitsIncrement: number = 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)

    private total: number= 0

    constructor(private sapService: SapService, private otpService: OtpService, private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit(): void {
        this.stateInit();
        var initialSearch = this.configService.listGetSearchText(this.listName)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }
        this.nbHitsShownObservable.next(this.nbHitsShown= this.configService.listGetNbHits(this.listName, this.nbHitsShown))

        var otpAddInfo = function (otp, otpSapMap, otpForBudgetMap) {
            otp.annotation.nbSapItems = otpSapMap.has(otp.data.name) ? otpSapMap.get(otp.data.name).sapIdSet.size : 0
            if (otpForBudgetMap.has(otp.data._id)) {
                let budgetInfo = otpForBudgetMap.get(otp.data._id)
                otp.annotation.amountSpentNotYetInSap = budgetInfo.annotation.amountSpentNotYetInSap
                otp.annotation.amountEngaged = budgetInfo.annotation.amountEngaged
                otp.annotation.amountBilled = budgetInfo.annotation.amountBilled
                otp.annotation.amountSpent = budgetInfo.annotation.amountSpent
                otp.annotation.amountAvailable = budgetInfo.annotation.amountAvailable
            }
            return otp
        }

        this.subscriptionOtps = Observable.combineLatest(this.otpsObservable, this.sapService.getSapOtpMapObservable(), this.otpService.getAnnotatedOtpsForBudgetMap(),
            this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch),
            (otps, otpSapMap, otpForBudgetMap, searchTxt: string) => {
                this.configService.listSaveSearchText(this.listName, searchTxt)
                if (searchTxt.trim() === '') return otps.filter(otp => !otp.data.isDeleted).map(otp => otpAddInfo(otp, otpSapMap, otpForBudgetMap));
                return otps.filter(otp => otp.data.name.toUpperCase().includes(searchTxt.toUpperCase())
                    || otp.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase())).map(otp => otpAddInfo(otp, otpSapMap, otpForBudgetMap));
            }).do(otps => {
                this.nbHits = otps.length
                this.total= otps.reduce((acc, otp) => acc + (+otp.annotation.amountAvailable || 0), 0)
            })
            .switchMap(otps => {
                return this.nbHitsShownObservable.map(nbItems => {
                    return otps.slice(0, nbItems)
                })
            }).subscribe(otps => {
                if (!comparatorsUtils.softCopy(this.otps, otps)) {
                    this.otps = comparatorsUtils.clone(otps)
                }
            });
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

    private moreHits() {
        this.nbHitsShown += this.nbHitsIncrement
        this.configService.listSaveNbHits(this.listName, this.nbHitsShown)        
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

}