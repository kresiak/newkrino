import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component({
        moduleId: module.id,
        selector: 'gg-product-enter',
        templateUrl: './product-enter.component.html'    
})
export class ProductEnterComponent implements OnInit {
    private productForm;

    constructor(private formBuilder: FormBuilder) {

    }

    @Input() supplierId: string;

    ngOnInit():void
    {
        this.productForm= this.formBuilder.group({
            description: ['', Validators.required],
            price: ['0', Validators.required]
        });
    }

    save(formValue, isValid)
    {
        var x = formValue;
    }
}