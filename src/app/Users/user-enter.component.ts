import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component(
    {
        selector: 'gg-user-enter',
        templateUrl: './user-enter.component.html'
    }
)

export class UserEnterComponent implements OnInit {
    
    private newUserForm: FormGroup;    

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore ) {}

    ngOnInit(): void {

        this.newUserForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(3)]],
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            isBlocked: [''],
            isLaboUser: [''],
            isAdmin: [''],
            password: ['']
        });
    };
    
    save(formValue, isValid)
    {
        this.dataStore.addData('users.krino', {
            name: formValue.name,
            firstName: formValue.firstName,
            isBlocked: formValue.isBlocked,
            isLaboUser: formValue.isLaboUser,
            isAdmin: formValue.isAdmin,
            password: formValue.password
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.newUserForm.reset();    
    }


}
