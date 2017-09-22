import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component(
    {
        selector: 'gg-register-enter',
        templateUrl: './register-enter.component.html'
    }
)
export class RegisterEnterComponent implements OnInit {
    isPageRunning: boolean= true;
    private registerEnterForm: FormGroup

    constructor( private dataStore: DataStore, private formBuilder: FormBuilder ) {
    }
    
    ngOnInit(): void {
        const emailRegex = /^[0-9a-z_.-]+@[0-9a-z.-]+\.[a-z]{2,3}$/i;

        this.registerEnterForm = this.formBuilder.group({
            firstName: ['', [Validators.required, Validators.minLength(2)]],
            lastName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.pattern(emailRegex)]],
            laboName: ['', [Validators.required, Validators.minLength(2)]],
            password: ['', [Validators.required, Validators.minLength(2)]],
            repeatPassword: ['', [Validators.required, Validators.minLength(2)]]
        });
    }

    saveUser(formValue, isValid) {
        this.dataStore.addData('users.public', {
            firstName: formValue.firstName,
            name: formValue.lastName,
            email: formValue.email,
            departmentName: formValue.laboName,
            password: formValue.password
        }).first().subscribe(res => {
        var x = res;
        this.resetRegisterEnterForm();
        });
    }
        
    resetRegisterEnterForm() {
        this.registerEnterForm.reset();
    }
        
    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}