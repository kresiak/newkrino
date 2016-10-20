import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp-list',
        templateUrl: './otp-list.component.html'
    }
)
export class OtpListComponent implements OnInit {
    @Input() otpsObservable: Observable<any>;
    private otps;

    ngOnInit(): void {
        this.otpsObservable.subscribe(otps => this.otps = otps);
    }

    getOtpObservable(id: string) {
        return this.otpsObservable.map(otps => otps.filter(otp => otp._id === id)[0]);
    }
}