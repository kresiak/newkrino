import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

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

    @Input() equipeObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }    



    ngOnInit(): void {
        this.stateInit();
        this.equipeObservable.subscribe(eq => {
            this.equipe = eq;
            if (eq) {
                this.pieSpentChart = this.chartService.getSpentPieData(this.equipe.annotation.amountSpent / this.equipe.annotation.budget * 100);
                this.usersObservable = this.dataStore.getDataObservable('krinousers').map(users => users.filter(user => this.equipe.data.Users.includes(user._id)));
                this.otpsObservable = this.orderService.getAnnotatedOtpsByEquipe(this.equipe.data._id);
                this.ordersObservable = this.orderService.getAnnotedOrdersByEquipe(eq.data._id);
                this.ordersObservable.subscribe(orders => this.anyOrder = orders && orders.length > 0);
            }
        });
    }


/*    @Input() selectedTabId;
    @Output() tabChanged = new EventEmitter();
*/

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


    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childOrdersStateChanged($event)
    {
        this.state.Orders= $event;
        this.stateChanged.next(this.state);
    }

    private childOtpsStateChanged($event)
    {
        this.state.Otps= $event;
        this.stateChanged.next(this.state);
    }

}