import {Component, Input} from '@angular/core';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-user',
        templateUrl: './user.component.html'
    }
)
export class UserComponent
{
    @Input() user;
}