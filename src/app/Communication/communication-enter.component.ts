import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component(
    {
        selector: 'gg-communication-enter',
        templateUrl: './communication-enter.component.html'
    }
)

export class CommunicationEnterComponent implements OnInit {
    private communicationMessageForm: FormGroup;
    
    constructor(private formBuilder: FormBuilder, private dataStore: DataStore ) {}

    ngOnInit(): void {
        this.communicationMessageForm = this.formBuilder.group({
            communicationMessage: ['', Validators.required]
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('messages', {
            message: formValue.communicationMessage
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    };

    reset()
    {
        this.communicationMessageForm.reset();        
    };
    

};
