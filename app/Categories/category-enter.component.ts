import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
//import { AuthService } from '../Shared/Services/auth.service'
import { Observable } from 'rxjs/Rx'

@Component({
        moduleId: module.id,
        selector: 'gg-category-enter',
        templateUrl: './category-enter.component.html'    
})
export class CategoryEnterComponent implements OnInit {
    private categoryForm: FormGroup;
    //private selectableUsers: Observable<any>;
    //private selectedUserIds;

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {

    }
 
    private isLabo: boolean;
    private isOffice: boolean;

    //@ViewChild('userSelector') usersChild;

    ngOnInit():void {
      //  this.selectableUsers = this.authService.getSelectableUsers();

        this.categoryForm = this.formBuilder.group({                      
            name: ['', [Validators.required, Validators.minLength(5)]],
            isBlocked: [''],
            noArticle: [''],
            groupMarch: ['']
        });
    }

    save(formValue, isValid)
    {
        this.dataStore.addData('categories', {
            name: formValue.name,
            isLabUpdated: this.isLabo,
            isOfficUpdated: this.isOffice,
            isBlocked: formValue.isBlocked,
            noArticle: formValue.noArticle,
            groupMarch: formValue.groupMarch
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.categoryForm.reset();    
        //this.usersChild.emptyContent()    
    }

    isLabUpdated(date) {
        this.isLabo = date;
    }

    isOfficUpdated(date) {
        this.isOffice = date;
    }
    //dateUpdatedStart(date) {
      //  this.datStart = date;
    //}
    //userSelectionChanged(selectedUserIds: string[]) {        
      //  this.selectedUserIds = selectedUserIds;
    //}

}

