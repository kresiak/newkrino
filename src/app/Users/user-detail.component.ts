import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
//import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        selector: 'gg-user-detail',
        templateUrl: './user-detail.component.html'
    }
)

export class UserDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService) {
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
  /*          if (user) {
                this.productsObservable= this.productService.getAnnotatedProductsWithBasketInfoByCategory(user.data._id)
                this.otpsObservable= this.orderService.getAnnotatedOpenOtpsByCategory(user.data._id)
            }
    */    });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
    };

    private user
//    private productsObservable : Observable<any> 
//    private otpsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
/*
    commentsUpdated(comments) {
        if (this.user && comments) {
            this.user.data.comments = comments;
            this.dataStore.updateData('users', this.user.data._id, this.user.data);
        }
    }

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
 *//*
    private childProductsStateChanged($event) {
        this.state.Products = $event;
        this.stateChanged.next(this.state);
    }    

    private childOtpsStateChanged($event)
    {
        this.state.Otps= $event;
        this.stateChanged.next(this.state);
    }

    dateUpdated(isBlockeds) {
        this.user.data.isBlocked = isBlockeds;
        this.dataStore.updateData('users', this.user.data._id, this.user.data);
    }

    isLabUpdated(isLabos) {
        this.user.data.isLabo = isLabos;
        this.dataStore.updateData('users', this.user.data._id, this.user.data);
    }
*/

}