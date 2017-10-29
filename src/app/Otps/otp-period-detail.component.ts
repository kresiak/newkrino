import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { OtpService } from '../Shared/Services/otp.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import * as comparatorsUtils from './../Shared/Utils/comparators'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import * as dateUtils from './../Shared/Utils/dates'

@Component(
    {
        selector: 'gg-otp-period-detail',
        templateUrl: './otp-period-detail.component.html'
    }
)
export class OtpPeriodDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService, private formBuilder: FormBuilder, private otpService: OtpService) {
    }
    private budgetChangeForm: FormGroup
    private dateInBudgetChangeForm: string

    private blockedAmountForm: FormGroup

    private nouvelleCreanceForm: FormGroup
    private dateNouvelleCreanceForm: string

    @Input() budgetPeriod
    @Input() otp
    @Input() budgetAnnotation

    private isPageRunning: boolean = true

    private authorizationStatusInfo: AuthenticationStatusInfo;



    ngOnInit(): void {
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.budgetChangeForm = this.formBuilder.group({
            budgetChange: ['', [Validators.required]],
            commentBudgetChange: ['', [Validators.required]]
        })

        this.blockedAmountForm = this.formBuilder.group({
            blockedAmount: ['', [Validators.required]],
            comment: ['', [Validators.required]]
        })

        this.nouvelleCreanceForm = this.formBuilder.group({
            depenseNouvelleCreance: ['', [Validators.required]],
            commentNouvelleCreance: ['', [Validators.required]]
        })
    }

    SaveBudgetChange(formValue, isValid) {
        if (!isValid) return
        if (!this.budgetPeriod.budgetHistory) this.budgetPeriod.budgetHistory = []

        this.budgetPeriod.budgetHistory.push({
            budgetIncrement: formValue.budgetChange,
            date: this.dateInBudgetChangeForm || dateUtils.nowFormated(),
            comment: formValue.commentBudgetChange
        })
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data).first().subscribe(res => {
            this.resetBudgetChange();
        });
    }

    resetBudgetChange() {
        this.budgetChangeForm.reset();
    }

    saveBlockedAmount(formValue, isValid) {
        if (!isValid) return
        if (!this.budgetPeriod.blockedAmounts) this.budgetPeriod.blockedAmounts = []

        this.budgetPeriod.blockedAmounts.push({
            amount: formValue.blockedAmount,
            comment: formValue.comment
        })
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data).first().subscribe(res => {
            this.resetBlockedAmount();
        });
    }

    resetBlockedAmount() {
        this.blockedAmountForm.reset();
    }

    checkCreances(): boolean {
        var lastAmount = -1
        var isOk: boolean = true
        this.budgetPeriod.creances.sort(dateUtils.getSortFn(x => x.date)).forEach(c => {
            if (isOk) {
                if (c.amount > this.budgetAnnotation.budgetAvailable) isOk = false
                if (c.amount > lastAmount && lastAmount !== -1) isOk = false
                lastAmount = c.amount
            }
        })
        return isOk
    }

    private creanceFormError: boolean= false

    SaveNouvelleCreance(formValue, isValid) {        
        if (!isValid) return
        if (!this.budgetPeriod.creances) this.budgetPeriod.creances = []
        this.creanceFormError= false

        this.budgetPeriod.creances.push({
            date: this.dateNouvelleCreanceForm || dateUtils.nowFormated(),
            amount: formValue.depenseNouvelleCreance,
            description: formValue.commentNouvelleCreance
        })

        if (this.checkCreances()) {
            this.dataStore.updateData('otps', this.otp.data._id, this.otp.data).first().subscribe(res => {
                this.resetNouvelleCreance();
            });
        }
        else {
            this.budgetPeriod.creances.pop()
            this.creanceFormError=true
        }
    }

    private creanceUpdateError: boolean= false

    dateCreanceChangeUpdated(creanceItem, dateChange) {
        this.creanceUpdateError= false
        var saved= creanceItem.date
        creanceItem.date = dateChange
        if (this.checkCreances()) {
            this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
        }
        else {
            this.creanceUpdateError= true
            creanceItem.date= saved
        }        
    }

    depenseCreanceChangeUpdated(creanceItem, depenseChange) {
        if (! +depenseChange) return
        this.creanceUpdateError= false
        var saved= creanceItem.amount
        creanceItem.amount = +depenseChange
        if (this.checkCreances()) {
            this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
        }
        else {
            this.creanceUpdateError= true
            creanceItem.amount= saved
        }        
    }

    commentCreanceChangeUpdated(creanceItem, description) {
        creanceItem.description = description
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }




    resetNouvelleCreance() {
        this.nouvelleCreanceForm.reset();
    }


    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    budgetPeriodUpdated(budget) {
        this.budgetPeriod.budget = +budget;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    datStartPeriodUpdated(date) {
        this.budgetPeriod.datStart = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    datEndPeriodUpdated(date) {
        this.budgetPeriod.datEnd = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    budgetChangeUpdated(budgetHistoryItem, budgetChange) {
        if (! +budgetChange) return
        budgetHistoryItem.budgetIncrement = +budgetChange
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    dateBudgetChangeUpdated(budgetHistoryItem, dateChange) {
        budgetHistoryItem.date = dateChange
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    commentsBudgetChangeUpdated(budgetHistoryItem, comment) {
        budgetHistoryItem.comment = comment
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    dateBudgetChangeInForm(dateInForm) {
        this.dateInBudgetChangeForm = dateInForm
    }

    blockedAmountUpdated(blockedAmountItem, amount) {
        if (! +amount) return
        blockedAmountItem.amount = +amount
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    blockedAmountCommentUpdated(blockedAmountItem, comment) {
        blockedAmountItem.comment = comment
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    dateNouvelleCreanceInForm(dateInForm) {
        this.dateNouvelleCreanceForm = dateInForm
    }

}
