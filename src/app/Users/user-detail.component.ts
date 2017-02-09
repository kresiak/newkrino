import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { NavigationService } from './../Shared/Services/navigation.service'

@Component(
    {
        selector: 'gg-user-detail',
        templateUrl: './user-detail.component.html'
    }
)

export class UserDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService, private navigationService: NavigationService) {
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
        this.userObservable.subscribe(user => {
            this.user = user;
        });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
    };

    private user
    private authorizationStatusInfo: AuthenticationStatusInfo;

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/category', this.category.data._id, this.path, this.isRoot)
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

    nameUserUpdated(name) {
        this.user.data.name = name;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    firstNameUserUpdated(firstName) {
        this.user.data.firstName = firstName;
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
/*
    commentsUpdated(comments) {
        if (this.user && comments) {
            this.user.data.comments = comments;
            this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
        }
    };
  */

}