import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { EquipeService } from '../Shared/Services/equipe.service';
import { OtpService } from '../Shared/Services/otp.service'
import { SapService } from './../Shared/Services/sap.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        //moduleId: module.id,
        templateUrl: './otp-list.routable.component.html'
    }
)
export class OtpListComponentRoutable implements OnInit {
    constructor(private equipeService: EquipeService, private navigationService: NavigationService, private authService: AuthService, private sapService: SapService, private otpService: OtpService) { }

    private isPageRunning: boolean = true

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
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }


    private otpsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
}

