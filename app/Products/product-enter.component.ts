import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import {ProductService} from '../Shared/Services/product.service'
import { SelectableData } from '../Shared/Classes/selectable-data'

@Component({
        moduleId: module.id,
        selector: 'gg-product-enter',
        templateUrl: './product-enter.component.html'    
})
export class ProductEnterComponent implements OnInit {
    private productForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private productService: ProductService) {

    }

    @Input() supplierId: string;

    private categoryData: SelectableData[];

    private isCategoryIdSelected(control: FormControl){   // custom validator implementing ValidatorFn 
            if (control.value === '-1') {
                return { "category": true };
            }

            return null;
        }

    ngOnInit():void
    {
        this.productService.getSelectableCategories().subscribe(cd => this.categoryData= cd);

        const priceRegEx = `^\\d+(.\\d*)?$`;

        this.productForm= this.formBuilder.group({
            description: ['', [Validators.required, Validators.minLength(5)]],
            price: ['', [Validators.required, Validators.pattern(priceRegEx)]],
            category: ['-1', this.isCategoryIdSelected]
        });
    }

    save(formValue, isValid)
    {
        this.productService.createProduct({
            Description: formValue.description,
            Supplier: this.supplierId,
            Prix: formValue.price,
            Categorie: [formValue.category]
        }).subscribe(res =>
        {
            var x=res;
            this.reset();
        });
    }

    reset()
    {
        this.productForm.reset();        
        this.productForm.controls['category'].setValue('-1');
    }
}