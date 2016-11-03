import { Component, Input, OnInit } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import {ChartService} from './../Shared/Services/chart.service'


@Component(
    {
        moduleId: module.id,
        selector: 'gg-equipe-detail',
        templateUrl: './equipe-detail.component.html'
    }
)
export class EquipeDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private orderService: OrderService, private userService: UserService, private chartService: ChartService) {
    }
    private pieSpentChart;

    ngOnInit(): void {
        this.equipeObservable.subscribe(eq => {
            this.equipe = eq;
            if (eq) {
                this.pieSpentChart= this.chartService.getSpentPieData(this.equipe.annotation.amountSpent / this.equipe.annotation.budget * 100);
                this.usersObservable = this.dataStore.getDataObservable('krinousers').map(users => users.filter(user => this.equipe.data.Users.includes(user._id)));
                this.otpsObservable = this.orderService.getAnnotatedOtpsByEquipe(this.equipe.data._id);
                this.ordersObservable = this.orderService.getAnnotedOrdersByEquipe(eq.data._id);
                this.ordersObservable.subscribe(orders => this.anyOrder = orders && orders.length > 0);
            }
        });
    }

    @Input() equipeObservable: Observable<any>;

    private usersObservable: Observable<any>;
    private otpsObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private equipe: any;
    private anyOrder: boolean;

    setDashlet() {
        this.userService.createEquipeDashletForCurrentUser(this.equipe.data._id);
    }

    removeDashlet(dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    }

    commentsUpdated(comments) {
        if (this.equipe && comments) {
            this.equipe.data.comments = comments;
            this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
        }
    }


}