import {Component, Input, OnInit} from '@angular/core';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp-list',
        templateUrl: './otp-list.component.html'
    }
)
export class OtpListComponent implements OnInit
{
    @Input() otps;

    ngOnInit() : void{
        
    }
}