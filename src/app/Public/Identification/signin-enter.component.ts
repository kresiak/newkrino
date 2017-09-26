import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
import { AuthAnoynmousService, SignedInStatusInfo } from './../../Shared/Services/auth-anonymous.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component(
    {
        selector: 'gg-signin-enter',
        templateUrl: './signin-enter.component.html'
    }
)
export class SigninEnterComponent implements OnInit {
    isPageRunning: boolean= true;
    private signinEnterForm: FormGroup
    authorizationStatusInfo: SignedInStatusInfo;


    constructor( private dataStore: DataStore, private formBuilder: FormBuilder, private authAnoynmousService: AuthAnoynmousService ) {
    }
    
    ngOnInit(): void {
        const emailRegex = /^[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}$/i;

        this.signinEnterForm = this.formBuilder.group({
            emailAddress: ['', [Validators.required, Validators.pattern(emailRegex)]],
            password: ['', [Validators.required, Validators.minLength(2)]]
        });

        this.authAnoynmousService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })
        
    }

    login(formValue, isValid) {
        this.authAnoynmousService.tryLogin(formValue.emailAddress, formValue.password)
    }
        
    resetSigninEnterForm() {
        this.signinEnterForm.reset();
    }
        
    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}