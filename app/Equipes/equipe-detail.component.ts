import { Component, Input, OnInit } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-equipe-detail',
        templateUrl: './equipe-detail.component.html'
    }
)
export class EquipeDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private orderService: OrderService) {

    }

    ngOnInit(): void {
        this.equipeObservable.subscribe(eq => {
            this.equipe = eq;
            this.usersObservable = this.dataStore.getDataObservable('krinousers').map(users => users.filter(user => this.equipe.Users.includes(user._id)));
            this.otpsObservable = this.dataStore.getDataObservable('otps').map(otps => otps.filter(otp => otp.Equipe === this.equipe._id));
            this.ordersObservable = this.orderService.getAnnotedOrdersByEquipe(eq._id);
            this.ordersObservable.subscribe(orders => this.anyOrder= orders && orders.length > 0);
        });
    }

    @Input() equipeObservable: Observable<any>;

    private usersObservable: Observable<any>;
    private otpsObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private equipe: any;
    private anyOrder: boolean;
}