import {Component, OnInit} from '@angular/core'
import {ApiService} from './../Shared/Services/api.service'

@Component(
 {
     moduleId: module.id,
     templateUrl: './equipe-list.component.html'
 }
)
export class EquipeListComponent implements OnInit{
    constructor(private apiService: ApiService)    {}

    equipes= [];

    ngOnInit():void{
        this.apiService.crudGetRecords('equipes').subscribe(
            res =>
            {
                this.equipes= res;
            },             
            err => console.log(err)
        );
    }

}

