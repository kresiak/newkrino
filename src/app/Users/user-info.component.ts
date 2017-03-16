import { Component, OnInit, Input } from '@angular/core'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { DataStore } from './../Shared/Services/data.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        selector: 'gg-user-info',
        templateUrl: './user-info.component.html'
    }
)

export class UserInfoComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService) {}

    ngOnInit(): void {
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });
    }
    

    @Input() userInfo; 

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
    }

    private subscriptionAuthorization: Subscription   
    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionUser: Subscription         

    isAdminOrCurrentUser() {
        return this.authorizationStatusInfo && (this.authorizationStatusInfo.isAdministrator() || this.userInfo.annotation.isCurrentUser)
    }

    emailUserUpdated(email) {
        this.userInfo.data.email = email;
        this.dataStore.updateData('users.krino', this.userInfo.data._id, this.userInfo.data);
    };

    nameUserUpdated(name) {
        this.userInfo.data.name = name;
        this.dataStore.updateData('users.krino', this.userInfo.data._id, this.userInfo.data);
    };

    firstNameUserUpdated(firstName) {
        this.userInfo.data.firstName = firstName;
        this.dataStore.updateData('users.krino', this.userInfo.data._id, this.userInfo.data);
    };

    passwordUpdated(password) {
        this.userInfo.data.password = password;
        this.dataStore.updateData('users.krino', this.userInfo.data._id, this.userInfo.data);
    };

  
}