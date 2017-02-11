import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
import { AuthService } from '../Shared/Services/auth.service'
import { OrderService } from '../Shared/Services/order.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component({
    //moduleId: module.id,
    selector: 'gg-equipe-group-enter',
    templateUrl: './equipe-group-enter.component.html'
})
export class EquipeGroupEnterComponent implements OnInit {
    private equipeForm: FormGroup;
    private selectableEquipes: Observable<any>;
    private selectedEquipeIds;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder, private authService: AuthService, private orderService: OrderService) {

    }

    @ViewChild('equipeSelector') equipesChild;

    ngOnInit(): void {
        this.selectableEquipes = this.orderService.getSelectableEquipes();

        this.equipeForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', Validators.required]
        });
    }

    save(formValue, isValid) {
        this.dataStore.addData('equipes.groups', {
            name: formValue.name,
            description: formValue.description,
            equipeIds: this.selectedEquipeIds.map(id => {
                return {
                    id: id,
                    weight: 1
                }
            })
        }).subscribe(res => {
            this.reset();
        });
    }

    reset() {
        this.equipeForm.reset();
        this.equipesChild.emptyContent()
    }

    equipeSelectionChanged(selectedEquipeIds: string[]) {
        this.selectedEquipeIds = selectedEquipeIds;
    }

}

