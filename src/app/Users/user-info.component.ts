import { Component, OnInit, Input } from '@angular/core'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { DataStore } from './../Shared/Services/data.service'
import { EquipeService } from '../Shared/Services/equipe.service';
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        selector: 'gg-user-info',
        templateUrl: './user-info.component.html'
    }
)

export class UserInfoComponent implements OnInit {
    constructor(private dataStore: DataStore, private authService: AuthService, private equipeService: EquipeService) {}

    private selectableEquipes: Observable<any>;
    private selectedEquipeIdsObservable

    ngOnInit(): void {
        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.selectableEquipes = this.equipeService.getSelectableEquipes();
        this.selectedEquipeIdsObservable= Observable.from([this.user.annotation.equipes.map(eq => eq._id)])     
    }
    

    @Input() user; 

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
    }

    equipeSelectionChanged(selectedIds: string[]) {
        var beforeIds: string[]= this.user.annotation.equipes.map(eq => eq._id)
        var toAddIds= selectedIds.filter(id => !beforeIds.includes(id))
        var toDeleteIds= beforeIds.filter(id => !selectedIds.includes(id))
        var userId= this.user.data._id

        toAddIds.forEach(equipeId => {
            this.dataStore.getDataObservable('equipes').map(equipes => equipes.filter(eq => eq._id === equipeId)[0])
                .do(equipe => {
                    if (!equipe.userIds) equipe.userIds=[]
                    if (!equipe.userIds.includes(userId)) {
                        equipe.userIds.push(userId)
                        this.dataStore.updateData('equipes', equipe._id, equipe)
                    }
                }).subscribe()
        })
        toDeleteIds.forEach(equipeId => {
            this.dataStore.getDataObservable('equipes').map(equipes => equipes.filter(eq => eq._id === equipeId)[0])
                .do(equipe => {
                    if (!equipe.userIds) equipe.userIds=[]
                    if (equipe.userIds.includes(userId)) {
                        var pos = equipe.userIds.findIndex(id => id === userId);
                        equipe.userIds.splice(pos, 1);
                        this.dataStore.updateData('equipes', equipe._id, equipe)
                    }
                }).subscribe()
        })
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