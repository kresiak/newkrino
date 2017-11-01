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
    @Input() otpSelectable: boolean= false
    @Input() selectedOtpId: string
    @Output() otpChosen= new EventEmitter()

    private authorizationStatusInfo: AuthenticationStatusInfo

    private otps: any[]

    ngOnInit(): void {
        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning)
            .subscribe(statusInfo => {
                this.authorizationStatusInfo = statusInfo
            })

        this.getOtpsCompatible().takeWhile(() => this.isPageRunning).subscribe(res => {
            this.otps= res
            this.otps.forEach(otp => {
                otp.selected=false
                if (otp.data._id === this.selectedOtpId) otp.selected= true
            })

        })
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    getOtpsCompatible(): Observable<any> {
        return this.otpChoiceService.getCompatibleOtpsObservable(this.equipeId, this.amount, this.classificationId)
    }

    otpClicked(otp) {
        this.otpChosen.next(otp.data._id)
        this.otps.forEach(otp => otp.selected=false)
        otp.selected= true
    }

}