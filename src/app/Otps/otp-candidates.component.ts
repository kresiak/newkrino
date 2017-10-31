import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { OtpChoiceService } from '../Shared/Services/otp-choice.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        selector: 'gg-otp-candidates',
        templateUrl: './otp-candidates.component.html'
    }
)
export class OtpCandidatesComponent implements OnInit {
    isPageRunning: boolean = true;

    constructor(private authService: AuthService, private otpChoiceService: OtpChoiceService) {
    }

    @Input() equipeId: string
    @Input() classificationId: string
    @Input() amount: number= 1

    private authorizationStatusInfo: AuthenticationStatusInfo

    ngOnInit(): void {
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning)
            .subscribe(statusInfo => {
                this.authorizationStatusInfo = statusInfo
            })
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    getOtpsCompatible(): Observable<any> {
        return this.otpChoiceService.getCompatibleOtpsObservable(this.equipeId, this.amount, this.classificationId)
    }

}