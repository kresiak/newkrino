import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'

@Component(
    {
        template: `<gg-otp-list [otpsObservable]= "otpsObservable"></gg-otp-list>`
    }
)
export class OtpListComponentRoutable implements OnInit {
    constructor(private orderService: OrderService) { }

    ngOnInit(): void {
        this.otpsObservable = this.orderService.getAnnotatedOtps();
    }

    private otpsObservable: Observable<any>;
}


@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp-list',
        templateUrl: './otp-list.component.html'
    }
)
export class OtpListComponent implements OnInit {
    @Input() otpsObservable: Observable<any>;
    @Input() config;

    private otps;

    ngOnInit(): void {
        this.otpsObservable.subscribe(otps => this.otps = otps);
    }

    getOtpObservable(id: string) {
        return this.otpsObservable.map(otps => otps.filter(otp => otp.data._id === id)[0]);
    }

    showColumn(columnName: string)
    {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }
    
}