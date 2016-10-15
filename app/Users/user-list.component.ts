import {Component, Input, OnInit} from '@angular/core';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-user-list',
        templateUrl: './user-list.component.html'
    }
)
export class UserListComponent implements OnInit
{
    @Input() users;

    ngOnInit() : void{
        
    }
}