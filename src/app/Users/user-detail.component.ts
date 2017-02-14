import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { OrderService } from './../Shared/Services/order.service'

@Component(
    {
        selector: 'gg-user-detail',
        templateUrl: './user-detail.component.html'
    }
)

export class UserDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService, private navigationService: NavigationService, private orderService: OrderService) {
    }

    @Input() userObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean= false
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    ngOnInit(): void {
        this.stateInit();
         this.subscriptionUser=this.userObservable.subscribe(user => {
            this.user = user;
            this.equipesObservable= this.orderService.getAnnotatedEquipesOfUser(user.data._id)
            this.ordersObservable = this.orderService.getAnnotedOrdersByUser(user.data._id);
        });
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
    };

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionUser.unsubscribe()
    }
    

    private user
    private equipesObservable: Observable<any>
    private ordersObservable: Observable<any>
    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription     
    private subscriptionUser: Subscription         

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/user', this.user.data._id, this.path, this.isRoot)
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

    private childEquipesStateChanged($event) {
        this.state.Equipes = $event;
        this.stateChanged.next(this.state);
    }

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    nameUserUpdated(name) {
        this.user.data.name = name;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    firstNameUserUpdated(firstName) {
        this.user.data.firstName = firstName;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    emailUserUpdated(email) {
        this.user.data.email = email;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    passwordUpdated(password) {
        this.user.data.password = password;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    isBlockedUpdated(isBlocked) {
        this.user.data.isBlocked = isBlocked;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    isLaboUserUpdated(isLabo) {
        this.user.data.isLaboUser = isLabo;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    isAdminUpdated(isAdmin) {
        this.user.data.isAdmin = isAdmin;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    commentsUpdated(comments) {
        if (this.user && comments) {
            this.user.data.comments = comments;
            this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
        }
    };

    isAdminOrCurrentUser() {
        return this.authorizationStatusInfo && (this.authorizationStatusInfo.isAdministrator() || this.user.annotation.isCurrentUser)
    }

}