import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-user-list',
        templateUrl: './user-list.component.html'
    }
)
export class UserListComponent implements OnInit
{
    @Input() usersObservable: Observable<any>;
    private users;

    ngOnInit() : void{
        this.usersObservable.subscribe(users => this.users= users);
    }

    getUserObservable(id: string)
    {
        return this.usersObservable.map(users => users.filter(user => user._id === id)[0]);
    }
}