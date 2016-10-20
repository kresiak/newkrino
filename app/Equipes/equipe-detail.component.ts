import {Component, Input, OnInit} from '@angular/core';
import {DataStore} from './../Shared/Services/data.service'
import {Observable} from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-equipe-detail',
        templateUrl: './equipe-detail.component.html'
    }
)
export class EquipeDetailComponent implements OnInit
{
    constructor(private dataStore: DataStore)    {

    }

    ngOnInit(): void{
        this.equipeObservable.subscribe(eq => this.equipe= eq);
        this.usersObservable=  this.dataStore.getDataObservable('krinousers').map(users => users.filter(user => this.equipe.Users.includes(user._id)));
        this.otpsObservable= this.dataStore.getDataObservable('otps').map(otps => otps.filter(otp => otp.Equipe===this.equipe._id));
    }

    @Input() equipeObservable : Observable<any>;

    private usersObservable : Observable<any>;
    private otpsObservable : Observable<any>;
    equipe:any;    
}