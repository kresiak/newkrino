import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { EquipeService } from '../Shared/Services/equipe.service';
import { OtpService } from '../Shared/Services/otp.service'
import { SapService } from './../Shared/Services/sap.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { DataStore } from './../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './otp-list.routable.component.html'
    }
)
export class OtpListComponentRoutable implements OnInit {
    nbExpiringOtps: number= 0;
    constructor(private equipeService: EquipeService, private navigationService: NavigationService, private authService: AuthService, private sapService: SapService, private otpService: OtpService,
        private dataStore: DataStore, private formBuilder: FormBuilder) { }

    private isPageRunning: boolean = true
    private classificationForm: FormGroup
    private classificationsList = []
    

    state: {}
    equipesObservable: Observable<any>;
    otpsObservableExpiring: Observable<any>;

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.navigationService.getStateObservable().takeWhile(() => this.isPageRunning).subscribe(state => {
            this.state = state
        })
        this.otpsObservable = this.otpService.getAnnotatedOtps();

        this.otpsObservableExpiring = this.otpService.getAnnotatedFinishingOtps();
        this.equipesObservable = this.equipeService.getAnnotatedEquipes();
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })

        this.otpsObservableExpiring.takeWhile(() => this.isPageRunning).subscribe(otps => {
            this.nbExpiringOtps= otps ? otps.length : 0
        })

        this.dataStore.getDataObservable('otp.product.classifications').takeWhile(() => this.isPageRunning).subscribe(classification => {
            if (!comparatorsUtils.softCopy(this.classificationsList, classification))
                this.classificationsList= comparatorsUtils.clone(classification)            
        })

        this.classificationForm = this.formBuilder.group({
            classificationName: ['', [Validators.required, Validators.minLength(3)]],
            classificationDescription: ['']
        })
    }

    save(formValue, isValid) {
        this.dataStore.addData('otp.product.classifications', {
            name: formValue.classificationName,
            description: formValue.classificationDescription
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.classificationForm.reset()
    }


    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    private otpsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;

    classificationsNameUpdated(classificationName, classificationsItem) {
        classificationsItem.name = classificationName
        this.dataStore.updateData('otp.product.classifications', classificationsItem._id, classificationsItem)
    }
    
    classificationsDescriptionUpdated(classificationDescription, classificationsItem) {
        classificationsItem.description = classificationDescription
        this.dataStore.updateData('otp.product.classifications', classificationsItem._id, classificationsItem)
    }
}

