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
    

    @Input() user; 

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
    }

    private subscriptionAuthorization: Subscription   
    private authorizationStatusInfo: AuthenticationStatusInfo
    //private subscriptionUser: Subscription         

    isAdminOrCurrentUser() {
        return this.authorizationStatusInfo && (this.authorizationStatusInfo.isAdministrator() || this.user.annotation.isCurrentUser)
    }

    emailUserUpdated(email) {
        this.user.data.email = email;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    nameUserUpdated(name) {
        this.user.data.name = name;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    firstNameUserUpdated(firstName) {
        this.user.data.firstName = firstName;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

    passwordUpdated(password) {
        this.user.data.password = password;
        this.dataStore.updateData('users.krino', this.user.data._id, this.user.data);
    };

  
}