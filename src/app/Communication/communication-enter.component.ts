import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../Shared/Services/auth.service'
import {OrderService} from '../Shared/Services/order.service'

@Component(
    {
        selector: 'gg-communication-enter',
        templateUrl: './communication-enter.component.html'
    }
)

export class CommunicationEnterComponent implements OnInit {
    private communicationMessageForm: FormGroup;
    private messagesList;
    private currentUserId: string;

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private authService: AuthService, private orderService: OrderService ) {}

    ngOnInit(): void {
        this.communicationMessageForm = this.formBuilder.group({
            communicationMessage: ['', Validators.required]
        });

        this.authService.getUserIdObservable().subscribe(id => {
            this.currentUserId = id
        });

        this.orderService.getAnnotatedMessages().subscribe(messages => {
        this.messagesList = messages;
        });
    };
    
    save(formValue, isValid)
    {
        this.dataStore.addData('messages', {
            message: formValue.communicationMessage,
            userId: this.currentUserId
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
