import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { PlatformService } from './../Shared/Services/platform.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        selector: 'gg-platform-enterprises',
        templateUrl: './platform-enterprises.component.html'
    }
)
export class PlatformEnterprisesComponent implements OnInit {
    constructor (private formBuilder: FormBuilder, private dataStore: DataStore, private platformService: PlatformService) {
    }

private enterprisesForm: FormGroup
private enterprisesList: any
private isPageRunning: boolean = true

    ngOnInit(): void {
        this.enterprisesForm = this.formBuilder.group({
            nameOfEnterprise: ['', [Validators.required, Validators.minLength(3)]],
            telephone: ['', Validators.required],
            fax: ['', Validators.required],
            web: ['', Validators.required]
        })

        this.platformService.getAnnotatedEnterprises().takeWhile(() => this.isPageRunning).subscribe(enterprises => {
            if (!comparatorsUtils.softCopy(this.enterprisesList, enterprises))
                this.enterprisesList = comparatorsUtils.clone(enterprises)            
        })
        
    }

    save(formValue, isValid) {
        this.dataStore.addData('platform.enterprises', {
            name: formValue.nameOfEnterprise,
            telephone: formValue.telephone,
            fax: formValue.fax,
            web: formValue.web
        }).subscribe(res =>
        {
            this.reset()
        })
    }

    reset()
    {
        this.enterprisesForm.reset()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    nameEnterpriseUpdated(name, enterpriseItem) {
        enterpriseItem.data.name = name
        this.dataStore.updateData('platform.enterprises', enterpriseItem.data._id, enterpriseItem.data)
    }

    telephoneEnterpriseUpdated(telephone, enterpriseItem) {
        enterpriseItem.data.telephone = telephone
        this.dataStore.updateData('platform.enterprises', enterpriseItem.data._id, enterpriseItem.data)
    }

    faxEnterpriseUpdated(fax, enterpriseItem) {
        enterpriseItem.data.fax = fax
        this.dataStore.updateData('platform.enterprises', enterpriseItem.data._id, enterpriseItem.data)
    }

    webEnterpriseUpdated(web, enterpriseItem) {
        enterpriseItem.data.web = web
        this.dataStore.updateData('platform.enterprises', enterpriseItem.data._id, enterpriseItem.data)
    }
   
}