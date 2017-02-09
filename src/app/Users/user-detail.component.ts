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
    private authorizationStatusInfo: AuthenticationStatusInfo;

}