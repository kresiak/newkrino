import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import {ProductService} from '../Shared/Services/product.service'
import { SelectableData } from '../Shared/Classes/selectable-data'
import { Observable, Subscription } from 'rxjs/Rx'

@Component({
        //moduleId: module.id,
        selector: 'gg-product-enter',
        templateUrl: './product-enter.component.html'    
})
export class ProductEnterComponent implements OnInit {
    private productForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private productService: ProductService) {

    }

    @Input() supplierId: string;

    private categoryData: SelectableData[]
    private subscriptioncategories: Subscription 

    private isCategoryIdSelected(control: FormControl){   // custom validator implementing ValidatorFn 
            if (control.value === '-1') {
                return { "category": true };
            }

            return null;
        }

    ngOnInit():void
    {
        this.subscriptioncategories= this.productService.getSelectableCategories().subscribe(cd => this.categoryData= cd);

        const priceRegEx = `^\\d+(.\\d*)?$`;

        this.productForm= this.formBuilder.group({
            description: ['', [Validators.required, Validators.minLength(5)]],
            price: ['', [Validators.required, Validators.pattern(priceRegEx)]],
            package: ['', Validators.required],
            category: ['-1', this.isCategoryIdSelected],
            catalogNr: ['', Validators.required],
            noarticle: ['', Validators.required],
            groupMarch: ['', Validators.required],
            tva: ['', Validators.required],
            isResold: [''],
            disabled: [''],
            isDistributed: ['']
        });
    }

    ngOnDestroy(): void {
         this.subscriptioncategories.unsubscribe()
    }

    save(formValue, isValid)
    {
        this.productService.createProduct({
            name: formValue.description,
            supplierId: this.supplierId,
            price: formValue.price,
            package: formValue.package,
            categoryIds: [formValue.category],
            catalogNr: formValue.catalogNr,
            noArticle: formValue.noarticle,
            groupMarch: formValue.groupMarch,
            tva: formValue.tva,
            isResold: formValue.isResold,
            disabled: formValue.disabled,
            isDistributed: formValue.isDistributed
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