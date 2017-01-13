import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-equipe-detail',
        templateUrl: './equipe-detail.component.html'
    }
)
export class EquipeDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private orderService: OrderService, private userService: UserService, private chartService: ChartService, private navigationService: NavigationService) {
    }
    private pieSpentChart;

    @Input() equipeObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean=false
    
    @Input() initialTab: string = '';
    @Output() stateChanged= new EventEmitter();

    private stateInit()
    {
        if (!this.state) this.state= {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }    



    ngOnInit(): void {
        this.stateInit();
        this.equipeObservable.subscribe(eq => {
            this.equipe = eq;
            if (eq) {
                this.pieSpentChart = this.chartService.getSpentPieData(this.equipe.annotation.amountSpent / this.equipe.annotation.budget * 100);
                this.usersObservable = this.dataStore.getDataObservable('users.krino').map(users => users.filter(user => this.equipe.data.userIds && this.equipe.data.userIds.includes(user._id)));
                this.otpsObservable = this.orderService.getAnnotatedOtpsByEquipe(this.equipe.data._id);
                this.ordersObservable = this.orderService.getAnnotedOrdersByEquipe(eq.data._id);
                this.orderService.hasEquipeAnyOrder(eq.data._id).subscribe(anyOrder => this.anyOrder=anyOrder);
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
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/equipe', this.equipe.data._id, this.path, this.isRoot)
            return
        }
        if ($event.nextId === 'gotoTop') {
            $event.preventDefault();
            this.navigationService.jumpToTop()
            return
        }        
        
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

    nameUpdated(name) {
        this.equipe.data.name = name;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    descriptionUpdated(name) {
        this.equipe.data.description = name;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    nbOfMonthAheadAllowedUpdated(nbOfMonths) {
        this.equipe.data.nbOfMonthAheadAllowed = nbOfMonths;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    blockedUpdated(isBlock) {
        this.equipe.data.isBlocked = isBlock;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }
}