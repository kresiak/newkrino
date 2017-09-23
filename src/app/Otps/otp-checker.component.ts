import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { EquipeService } from '../Shared/Services/equipe.service'
import { OtpService } from '../Shared/Services/otp.service'
import { OtpChoiceService } from '../Shared/Services/otp-choice.service'

import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        selector: 'gg-otp-checker',
        templateUrl: './otp-checker.component.html'
    }
)
export class OtpCheckerComponent implements OnInit {
    isPageRunning: boolean= true;

    constructor(private equipeService: EquipeService, private authService: AuthService, private otpService: OtpService, private otpChoiceService: OtpChoiceService) {
    }

    private equipeListObservable
    private authorizationStatusInfo: AuthenticationStatusInfo    
    private classificationsList = []  
    private equipeId: string  

    ngOnInit(): void {
        this.equipeListObservable = this.equipeService.getEquipesForAutocomplete() 

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
            this.equipeId= statusInfo.currentEquipeId
        })

        this.otpService.getAnnotatedClassifications().takeWhile(() => this.isPageRunning).subscribe(classification => {
            this.classificationsList= classification
        })
        

    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    equipeChanged(equipeId) {
        this.equipeId= equipeId
    }

    getOtpsCompatible(classificationsItem, equipeId): Observable<any> {
        var classificationId= classificationsItem.data._id
        return this.otpChoiceService.getCompatibleOtpsObservable(equipeId, classificationsItem.valueToSpend || 1, classificationId)
    }

    getFirstOtpCompatible(classificationsItem, equipeId): Observable<any> {
        var classificationId= classificationsItem.data._id
        return this.otpChoiceService.getCompatibleOtpsObservable(equipeId, classificationsItem.valueToSpend || 1, classificationId).map(otps => otps.length > 0 ? otps[0] : undefined)
    }

    getFirstOtpCompatibleOrEmpty(classificationsItem, equipeId): Observable<any> {
        var classificationId= classificationsItem.data._id
        return this.otpChoiceService.getCompatibleOtpsObservable(equipeId, classificationsItem.valueToSpend || 1, classificationId).map(otps => otps.length > 0 ? otps[0] : 
            {
                data: {},
                annotation: {}
            }
        )
    }


    changePrice(classificationsItem, data) {
         classificationsItem.valueToSpend=+data.target.value
    }
}