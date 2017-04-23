import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { SelectableData } from '../../Shared/Classes/selectable-data'
import { DataStore } from '../../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../../Shared/Services/auth.service'
import { AdminService } from '../../Shared/Services/admin.service'

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
            this.labo = labo
            this.selectedAdminsIdsObservable = Observable.from([this.labo.data.adminIds]);
            this.selectedSecrExecIdsObservable = Observable.from([this.labo.data.secrExecIds]);
        })
    }

    private saveLabo() {
        if (this.labo.data._id) {
            this.dataStore.updateData('labos', this.labo.data._id, this.labo.data);
        }
        else {
            this.dataStore.addData('labos', this.labo.data)
        }
    }

    nameUpdated(name: string) {
        this.labo.data.name = name;
        this.saveLabo()
    }

    headSelectionChanged(selectedIds: string[]) {
        this.labo.data.adminIds = selectedIds;
        this.saveLabo()
    }

    secrExecSelectionChanged(selectedIds: string[]) {
        this.labo.data.secrExecIds = selectedIds;
        this.saveLabo()
    }

    private findStepByName(stepName) {
        return this.labo.annotation.validationSteps.filter(s => s.name === stepName)[0]
    }

    private saveSteps() {
        var stepsToSave: any[] = this.labo.annotation.validationSteps.filter(s => s.enabled).map(s => s)
        stepsToSave.forEach(step => {
            delete step.enabled
        });
        this.labo.data.validationSteps = stepsToSave
        this.saveLabo()
    }

    selectStep(isChecked, stepName) {
        var step = this.findStepByName(stepName)
        if (step) {
            step.enabled = isChecked
            this.saveSteps()
        }
    }

    private swapElements(list, x, y) {
        var b = list[y];
        list[y] = list[x];
        list[x] = b;
    }

    stepUp(index) {
        if (index < 1) return
        this.swapElements(this.labo.annotation.validationSteps, index-1, index)
        this.saveSteps()
    }

    stepDown(index) {
        if (index + 1 >= this.labo.data.validationSteps.length) return
        this.swapElements(this.labo.annotation.validationSteps, index, index+1)
        this.saveSteps()
    }

}