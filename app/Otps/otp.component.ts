import {Component, Input} from '@angular/core';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp',
        templateUrl: './otp.component.html'
    }
)
export class OtpComponent
{
    @Input() otp;
}