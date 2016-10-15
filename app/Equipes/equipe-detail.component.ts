import {Component, Input, OnInit} from '@angular/core';
import {ApiService} from './../Shared/Services/api.service'
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
    constructor(private apiService: ApiService)    {}

    ngOnInit(): void{
        Observable.forkJoin([
            this.apiService.crudGetRecord('equipes', this.equipeId), this.apiService.crudGetRecords("krinousers"), this.apiService.crudGetRecords("otps")
        ]).subscribe(
            data =>
            {
                this.equipe= data[0];
                this.equipe.users=data[1].filter(user => this.equipe.Users.includes(user._id));
                this.equipe.otps=data[2].filter(otp => otp.Equipe === this.equipeId);   
            }
        );
    }

    @Input() equipeId;
    equipe:any;    
}