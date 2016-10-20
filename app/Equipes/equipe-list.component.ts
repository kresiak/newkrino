import {Component, OnInit} from '@angular/core'
import {DataStore} from './../Shared/Services/data.service'
import {Observable} from 'rxjs/Rx'

@Component(
 {
     moduleId: module.id,
     templateUrl: './equipe-list.component.html'
 }
)
export class EquipeListComponent implements OnInit{
    constructor(private dataStore: DataStore)    {}

    equipes: Observable<any>;

    ngOnInit():void{
        this.equipes= this.dataStore.getDataObservable('equipes');
    }

   getEquipeObservable(id: string) : Observable<any>
    {
        return this.equipes.map(equipes=> equipes.filter(s => s._id===id)[0]);
    }    
}

