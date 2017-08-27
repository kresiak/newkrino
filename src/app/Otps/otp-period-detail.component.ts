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
    }

    SaveBudgetChange(formValue, budgetItem, isValid) {
        if (!isValid) return
        if (!budgetItem.budgetHistory) budgetItem.budgetHistory = []

        budgetItem.budgetHistory.push({
            budgetIncrement: formValue.budgetChange,
            date: this.dateInBudgetChangeForm || moment().format('DD/MM/YYYY HH:mm:ss'),
            comment: formValue.commentBudgetChange
        })
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data).first().subscribe(res => {
            this.resetBudgetChange();
        });
    }

    resetBudgetChange() {
        this.budgetChangeForm.reset();
    }

    saveBlockedAmount(formValue, budgetItem, isValid) {
        if (!isValid) return
        if (!budgetItem.blockedAmounts) budgetItem.blockedAmounts = []

        budgetItem.blockedAmounts.push({
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


    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    budgetPeriodUpdated(budgetPeriod) {
        this.budgetPeriod.budget = +budgetPeriod;
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

}
