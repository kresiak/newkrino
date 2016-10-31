import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
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

    searchControl = new FormControl();
    searchForm;

    private otps;

    constructor() {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    ngOnInit(): void {
        Observable.combineLatest(this.otpsObservable, this.searchControl.valueChanges.startWith(''), (otps, searchTxt: string) => {
            if (searchTxt.trim() === '') return otps;
            return otps.filter(otp => otp.data.Name.toUpperCase().includes(searchTxt.toUpperCase()) 
                                    || otp.annotation.equipe.toUpperCase().includes(searchTxt.toUpperCase()));
        }).subscribe(otps => this.otps = otps);;
    }

    getOtpObservable(id: string) {
        return this.otpsObservable.map(otps => otps.filter(otp => otp.data._id === id)[0]);
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

}