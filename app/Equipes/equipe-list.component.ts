import {Component, OnInit} from '@angular/core'
import {OrderService} from './../Shared/Services/order.service'
import {Observable} from 'rxjs/Rx'

@Component(
 {
     moduleId: module.id,
     templateUrl: './equipe-list.component.html'
 }
)
export class EquipeListComponent implements OnInit{
    constructor(private orderService: OrderService)    {}

    equipes: Observable<any>;

    ngOnInit():void{
        this.equipes= this.orderService.getAnnotatedEquipes();
    }

   getEquipeObservable(id: string) : Observable<any>
    {
        return this.equipes.map(equipes=> equipes.filter(s => s.data._id===id)[0]);
    }    
}

