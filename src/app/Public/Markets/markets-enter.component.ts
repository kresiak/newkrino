import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../../Shared/Services/data.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component(
    {
        selector: 'gg-enter-market-product',
        templateUrl: './markets-enter.component.html'
    }
)
export class MarketsEnterComponent implements OnInit {
    isPageRunning: boolean= true;
    private marketsEnterForm: FormGroup

    constructor( private dataStore: DataStore, private formBuilder: FormBuilder ) {
    }
    
    ngOnInit(): void {

        this.marketsEnterForm = this.formBuilder.group({
            nameOfProduct: ['', [Validators.required, Validators.minLength(2)]],
            package: ['', [Validators.required, Validators.minLength(2)]],
            supplier: [''],
            catalogNr: [''],
            price: [''] ,           
            justification: ['']
        });
    }

    save(formValue, isValid) {
        this.dataStore.addData('products.market', {
            name: formValue.nameOfProduct,
            package: formValue.package,
            supplier: formValue.supplier,
            catalogNr: formValue.catalogNr,
            price: formValue.price,
            justification: formValue.justification
        }).first().subscribe(res => {
        var x = res;
        this.resetMarketsEnterForm();
        });
    }
        
    resetMarketsEnterForm() {
        this.marketsEnterForm.reset();
    }
        
    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}