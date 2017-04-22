import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { SelectableData } from '../../Shared/Classes/selectable-data'
import {DataStore} from '../../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../../Shared/Services/auth.service'
import {AdminService} from '../../Shared/Services/admin.service'

@Component(
    {
        selector: 'gg-admin-labo',
        templateUrl: './component.html'
    }
)

export class AdminLabo {
    constructor(private dataStore: DataStore, private authService: AuthService, private adminService: AdminService) {
    }

    private selectableUsers: Observable<SelectableData[]>;
    private labo
    private selectedAdminsIdsObservable: Observable<any>;
    private selectedSecrExecIdsObservable: Observable<any>;

    ngOnInit(): void {
        this.selectableUsers = this.authService.getSelectableUsers(true);

        this.adminService.getLabo().subscribe(labo => {
            this.labo= labo
            this.selectedAdminsIdsObservable = Observable.from([this.labo.adminIds]);
            this.selectedSecrExecIdsObservable = Observable.from([this.labo.secrExecIds]);
        })
    }

    private saveLabo() {
        if (this.labo._id) 
        {
            this.dataStore.updateData('labos', this.labo._id, this.labo);
        }
        else {
            this.dataStore.addData('labos', this.labo)
        }
    }

    nameUpdated(name: string) {
        this.labo.name = name;
        this.saveLabo()
    }

    headSelectionChanged(selectedIds: string[]) {
        this.labo.adminIds = selectedIds;
        this.saveLabo()
    }

    secrExecSelectionChanged(selectedIds: string[]) {
        this.labo.secrExecIds = selectedIds;
        this.saveLabo()
    }

}