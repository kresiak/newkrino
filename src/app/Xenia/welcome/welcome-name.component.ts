import { Component, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'


import { XeniaWelcomeService } from '../services/welcome.service'

@Component(
    {
        templateUrl: './welcome-name.component.html'
    }
)
export class XeniaWelcomeNameComponent implements OnInit {
    constructor(private welcomeService: XeniaWelcomeService, private formBuilder: FormBuilder) { }

    private form: FormGroup;

    ngOnInit(): void {
        var data= this.welcomeService.getData()

        this.form = this.formBuilder.group({
            firstName: [data.firstName],
            name: [data.name]
        });       

        this.form.valueChanges.startWith(this.form.value).takeWhile(() => this.isPageRunning).subscribe(formData => {
            this.doFormValidation(formData)
        })
    }

    private isPageRunning: boolean= true

    ngOnDestroy(): void {
        this.isPageRunning= false
    }

    private doFormValidation(formData) {
        if ((formData.name || '').trim().length > 0 && (formData.firstName || '').trim().length > 0) {
            this.welcomeService.nextEnable(() => {
                this.welcomeService.setNameData(formData.name.trim(), formData.firstName.trim()) 
                this.welcomeService.navigateTo('nameConfirm')               
            })
        }
        else {
            this.welcomeService.nextDisable()
        }        
    }

}
