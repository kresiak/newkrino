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
    isPageRunning: boolean = true;
    private marketsEnterForm: FormGroup

    constructor(private dataStore: DataStore, private formBuilder: FormBuilder) {
    }


    ngOnInit(): void {

        this.marketsEnterForm = this.formBuilder.group({
            nameOfProduct: ['', [Validators.required, Validators.minLength(2)]],
            package: ['', [Validators.required, Validators.minLength(2)]],
            supplier: [''],
            catalogNr: [''],
            price: [''],
            justification: ['']
        });
    }

    save(formValue, isValid, resteAll: boolean) {
        this.dataStore.getDataObservable('products.market').first().map(products => products.filter(p => p.name.toUpperCase().trim() === formValue.nameOfProduct.toUpperCase().trim() && p.package.toUpperCase().trim() === formValue.package.toUpperCase().trim()))
            .switchMap(products => {
                if (products.length > 0) {
                    var theProduct = products[0]
                    if (!theProduct.items) theProduct.items = []
                    theProduct.items.push({
                        supplier: formValue.supplier,
                        catalogNr: formValue.catalogNr,
                        price: formValue.price,
                        justification: formValue.justification
                    })
                    return this.dataStore.updateData('products.market', theProduct._id, theProduct)
                }
                else {
                    var newProduct = {
                        name: formValue.nameOfProduct,
                        package: formValue.package,
                        items: [{
                            supplier: formValue.supplier,
                            catalogNr: formValue.catalogNr,
                            price: formValue.price,
                            justification: formValue.justification
                        }]
                    }
                    return this.dataStore.addData('products.market', newProduct)
                }
            }).subscribe(res => {
                this.resetMarketsEnterForm(resteAll);
            })
    }

    resetMarketsEnterForm(resetAll: boolean) {
        if (resetAll) this.marketsEnterForm.controls['nameOfProduct'].setValue('')
        if (resetAll) this.marketsEnterForm.controls['package'].setValue('')
        this.marketsEnterForm.controls['supplier'].setValue('')
        this.marketsEnterForm.controls['catalogNr'].setValue('')
        this.marketsEnterForm.controls['price'].setValue('')
        this.marketsEnterForm.controls['justification'].setValue('')
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

}