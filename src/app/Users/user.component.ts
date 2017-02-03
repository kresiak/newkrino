import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Rx'
import {DataStore} from './../Shared/Services/data.service'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-user',
        templateUrl: './user.component.html'
    }
)
export class UserComponent implements OnInit
{
    constructor(private dataStore: DataStore) {}

    ngOnInit():void 
    {
        this.userObservable.subscribe(user => this.user= user);
    }

    @Input() userObservable : Observable<any>;
    private user;
}