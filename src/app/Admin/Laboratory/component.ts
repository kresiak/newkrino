import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap'
import { SelectableData } from '../../Shared/Classes/selectable-data'
import { DataStore } from '../../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../../Shared/Services/auth.service'
import { AdminService } from '../../Shared/Services/admin.service'
import { OrderService } from '../../Shared/Services/order.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component(
    {
        selector: 'gg-admin-labo',
        templateUrl: './component.html'
    }
)

export class AdminLabo {
    constructor(private dataStore: DataStore, private authService: AuthService, private adminService: AdminService, private orderService: OrderService,
        private formBuilder: FormBuilder) {
    }

    private selectableUsers: Observable<SelectableData[]>;
    private labo
    private selectedAdminsIdsObservable: Observable<any>;
    private selectedSecrExecIdsObservable: Observable<any>;
    private equipeListObservable
    private deliveryAdresses: any[]
    private addAddressForm: FormGroup;

    ngOnInit(): void {
        this.selectableUsers = this.authService.getSelectableUsers(true);

        this.adminService.getLabo().subscribe(labo => {
            this.labo = labo
            this.selectedAdminsIdsObservable = Observable.from([this.labo.data.adminIds]);
            this.selectedSecrExecIdsObservable = Observable.from([this.labo.data.secrExecIds]);
        })

        this.dataStore.getDataObservable('delivery.address').subscribe(deliveryAdresses => {
            this.deliveryAdresses= deliveryAdresses
        })

        this.equipeListObservable = this.orderService.getAnnotatedEquipes().map(equipes => equipes.map(eq => {
            return {
                id: eq.data._id,
                name: eq.data.name
            }
        }));

        this.addAddressForm = this.formBuilder.group({
            nomAddAddress: ['', [Validators.required]],
            descriptionAddAddress1: ['', [Validators.required]],
            descriptionAddAddress2: ['', [Validators.required]],
            descriptionAddAddress3: [''],
            descriptionAddAddress4: ['']
        });

    }

    save(formValue, isValid) {
       this.dataStore.addData('delivery.address', {
            nom: formValue.nomAddAddress,
            description1: formValue.descriptionAddAddress1,
            description2: formValue.descriptionAddAddress2,
            description3: formValue.descriptionAddAddress3,
            description4: formValue.descriptionAddAddress4
        }).first().subscribe(res => {
            var x = res;
            this.resetAddAddressForm();
        });
    }

    resetAddAddressForm() {
        this.addAddressForm.reset();
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

    groupedPasswordChanged(groupedPassword: string) {
        this.labo.data.passwordGroupOrdersUser = groupedPassword;
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
        this.swapElements(this.labo.annotation.validationSteps, index - 1, index)
        this.saveSteps()
    }

    stepDown(index) {
        if (index + 1 >= this.labo.data.validationSteps.length) return
        this.swapElements(this.labo.annotation.validationSteps, index, index + 1)
        this.saveSteps()
    }

    equipeChanged(newid, index) {
        if (!newid) {
            this.labo.annotation.validationSteps[index].equipeId = undefined
            if (this.labo.annotation.validationSteps[index].enabled) {
                this.labo.annotation.validationSteps[index].enabled = false
                this.saveSteps()
            }
            return
        }
        this.labo.annotation.validationSteps[index].equipeId = newid
        if (this.labo.annotation.validationSteps[index].enabled) {
            this.saveSteps()
        }
    }
    
    nomDeliveryUpdated(delivery, nomDelivery) {
        if (nomDelivery.trim() === '') return 
        delivery.nom = nomDelivery;
        this.dataStore.updateData('delivery.address', delivery._id, delivery)       
    }

    description1DeliveryUpdated(delivery, desc1) {
        delivery.description1 = desc1
        this.dataStore.updateData('delivery.address', delivery._id, delivery);
    }

    description2DeliveryUpdated(delivery, desc2) {
        delivery.description2 = desc2
        this.dataStore.updateData('delivery.address', delivery._id, delivery);
    }

    description3DeliveryUpdated(delivery, desc3) {
        delivery.description3 = desc3
        this.dataStore.updateData('delivery.address', delivery._id, delivery);
    }

    description4DeliveryUpdated(delivery, desc4) {
        delivery.description4 = desc4
        this.dataStore.updateData('delivery.address', delivery._id, delivery);
    }

    startOfKrino(krinoStartDate) {
        this.labo.data.krinoStartDate = krinoStartDate;
        this.saveLabo()
    }
}