import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { OtpService } from '../Shared/Services/otp.service'
import { ConfigService } from './../Shared/Services/config.service'
import { SapService } from './../Shared/Services/sap.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as comparatorsUtils from './../Shared/Utils/comparators'
import * as reportsUtils from './../Shared/Utils/reports'
import * as dateUtils from './../Shared/Utils/dates'


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

    private otps;
    otpSapMap: Map<string, any>;

    constructor(private sapService: SapService, private otpService: OtpService, private configService: ConfigService) {
    }

    filterOtps(otp, txt) {
        if (txt === '' || txt === '#') return !otp.data.isDeleted

        if (txt.startsWith('#LI')) {
            return otp.data.isLimitedToOwner && !otp.data.isDeleted
        }
        if (txt.startsWith('#NL')) {
            return !otp.data.isLimitedToOwner && !otp.data.isDeleted
        }
        if (txt.startsWith('#DE')) {
            return otp.data.isDeleted
        }
        if (txt.startsWith('#BL')) {
            return otp.data.isBlocked && !otp.data.isDeleted
        }
        if (txt.startsWith('#CL')) {
            return otp.data.isClosed && !otp.data.isDeleted
        }
        if (txt.startsWith('#P0')) {
            return !otp.data.priority && !otp.data.isDeleted
        }
        if (txt.startsWith('#OK')) {
            return otp.data.priority && !otp.data.isDeleted && !otp.data.isClosed && !otp.data.isBlocked
        }
        if (txt.startsWith('#NO')) {
            return (!otp.data.priority || otp.data.isClosed || otp.data.isBlocked) && !otp.data.isDeleted
        }
        if (txt.startsWith('#CR')) {
            return otp.annotation.currentPeriodAnnotation && otp.annotation.currentPeriodAnnotation.datNextCreance
        }

        return otp.data.name.toUpperCase().includes(txt) || otp.annotation.equipe.toUpperCase().includes(txt) || otp.annotation.classification.toUpperCase().includes(txt)
    }

    calculateTotal(otps): number {
        return otps.filter(otp => !otp.data.isDeleted).reduce((acc, otp) => acc + (+otp.annotation.amountAvailable || 0), 0)
    }


    private otpAddInfo = function (otp, otpSapMap) {
        otp.annotation.nbSapItems = otpSapMap.has(otp.data.name) ? otpSapMap.get(otp.data.name).sapIdSet.size : 0
        return otp
    }

    ngOnInit(): void {
        this.stateInit();

        this.sapService.getSapOtpMapObservable().takeWhile(() => this.isPageRunning).subscribe(otpSapMap => {
            this.otpSapMap = otpSapMap
        })

    }

    private isPageRunning: boolean = true


    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    setOtps(otps) {
        this.otps= otps.map(otp => this.otpAddInfo(otp, this.otpSapMap))
    }

    createReport(otps) {

        var fnFormat = otp => {
            return {
                Otp: otp.data.name,
                Budget: otp.annotation.budget.toLocaleString('fr-BE', {useGrouping: false}),
                Engaged: otp.annotation.amountEngaged.toLocaleString('fr-BE', {useGrouping: false}),
                'Engaged in Krino': otp.annotation.amountSpentNotYetInSap.toLocaleString('fr-BE', {useGrouping: false}),
                Invoiced: otp.annotation.amountBilled.toLocaleString('fr-BE', {useGrouping: false}),
                Available: otp.annotation.amountAvailable.toLocaleString('fr-BE', {useGrouping: false}),
                Until: otp.annotation.currentPeriodAnnotation ? dateUtils.formatShortDate(otp.annotation.currentPeriodAnnotation.datEnd) : 'not for current period',
                Deleted: otp.data.isDeleted ? 'Deleted ' : '',
                Blocked: otp.data.isBlocked ? 'Blocked ' : '',
                Closed: otp.data.isClosed ? 'Closed ' : '',
                Priority: !otp.data.priority ? 'No priority ' : otp.data.priority,
                'Limited to equipe': otp.data.isLimitedToOwner ? 'Limited ' : '',
                Equipe: otp.annotation.equipe,
                'Nb times in Sap': otp.annotation.nbSapItems,
            }
        }

        var listNonDeleted = otps.filter(otp => !otp.data.isDeleted && !otp.data.isBlocked).map(fnFormat)
        var listDeleted = otps.filter(otp => otp.data.isDeleted).map(fnFormat)
        var listBlocked = otps.filter(otp => otp.data.isBlocked).map(fnFormat)

        reportsUtils.generateReport(listNonDeleted.concat(listBlocked).concat(listDeleted))
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

    private getStatusText(otp): Observable<string> {

        return Observable.combineLatest(this.configService.getTranslationWord('OTP.COLUMN.DELETED'), this.configService.getTranslationWord('OTP.COLUMN.BLOCKED'), this.configService.getTranslationWord('OTP.COLUMN.LIMITED'), 
                                        this.configService.getTranslationWord('OTP.COLUMN.CLOSED'), this.configService.getTranslationWord('OTP.COLUMN.NO PRIORITY'),
            (deletedTxt, blockedTxt, limitedTxt, closedTxt, noPriorityTxt) => {
                var txt= (otp.data.isDeleted ? (deletedTxt + ' ') : '') + (otp.data.isBlocked ? (blockedTxt + ' ') : '') + (otp.data.isLimitedToOwner ? (limitedTxt + ' ') : '') + (otp.data.isClosed ? (closedTxt + ' ') : '') + (!otp.data.priority ? (noPriorityTxt + ' ') : '') 
                return txt.trim()
            })
    }

}