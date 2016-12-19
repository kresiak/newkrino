import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'

@Component({
        moduleId: module.id,
        selector: 'gg-equipe-enter',
        templateUrl: './equipe-enter.component.html'    
})
export class EquipeEnterComponent implements OnInit {
    private equipeForm: FormGroup;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }
 
    ngOnInit():void
    {

        this.equipeForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(5)]],
            description: ['', Validators.required],
            nbOfMonthAheadAllowed: [''],
            isBlocked: [''],
            userIds: ['']
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('equipes', {
            name: formValue.name,
            description: formValue.description,
            nbOfMonthAheadAllowed: formValue.nbOfMonthAheadAllowed,
            isBlocked: formValue.isBlocked,
            userIds: ['58402ef9f9690561d454c325', '58402ef9f9690561d454c342', '58402ef9f9690561d454c351']
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.equipeForm.reset();        
    }

}

