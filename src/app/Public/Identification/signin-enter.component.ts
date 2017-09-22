import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
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

    constructor( private dataStore: DataStore, private formBuilder: FormBuilder ) {
    }
    
    ngOnInit(): void {
        const emailRegex = /^[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}$/i;

        this.signinEnterForm = this.formBuilder.group({
            emailAddress: ['', [Validators.required, Validators.pattern(emailRegex)]],
            password: ['', [Validators.required, Validators.minLength(2)]]
        });
    }

    login(formValue, isValid) {
        this.dataStore.addData('', {
            email: formValue.emailAddress,
            password: formValue.password
        }).first().subscribe(res => {
        var x = res;
        this.resetSigninEnterForm();
        });
    }
        
    resetSigninEnterForm() {
        this.signinEnterForm.reset();
    }
        
    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}