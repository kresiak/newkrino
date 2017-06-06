import { Component, Input, Output, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { ProductService } from '../Shared/Services/product.service'
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
    private subscriptioncategories2: Subscription
    private subscriptionCheckCatNr: Subscription
    private categories
    private alreadyCatNrInDb: boolean= false

    private isCategoryIdSelected(control: FormControl) {   // custom validator implementing ValidatorFn 
        if (control.value === '-1') {
            return { "category": true };
        }

        return null;
    }

    ngOnInit(): void {
        this.subscriptioncategories = this.productService.getSelectableCategories().subscribe(cd => this.categoryData = cd);

        this.subscriptioncategories2 = this.productService.getAnnotatedCategories().subscribe(categories => this.categories = categories)

        const priceRegEx = `^\\d+(.\\d*)?$`;

        this.productForm = this.formBuilder.group({
            nameOfProduct: ['', [Validators.required, Validators.minLength(5)]],
            description: [''],
            price: ['', [Validators.required, Validators.pattern(priceRegEx)]],
            package: ['', Validators.required],
            category: ['-1', this.isCategoryIdSelected],
            catalogNr: ['', Validators.required],
            noarticle: ['', Validators.required],
            groupMarch: ['', Validators.required],
            tva: ['', Validators.required],
            disabled: [''],
            isStock: [''],
            needsLotNumber: [''],
            divisionFactor: ['1'],
            stockPackage: ['']
        });

        this.subscriptionCheckCatNr= this.productForm.controls['catalogNr'].valueChanges.debounceTime(400).distinctUntilChanged().startWith('').subscribe(catNr => {
            this.alreadyCatNrInDb=false
            if (catNr && catNr.length > 3) {   // Testing catNr because on KR computer it crashed with catNr === null - don't understand how it could happen
                this.productService.getAnnotatedProductsByCatalogNr(catNr).first().subscribe(prodList => {
                    this.alreadyCatNrInDb= prodList && prodList.length > 0
                })
            }
        })
    }

    ngOnDestroy(): void {
        this.subscriptioncategories.unsubscribe()
        this.subscriptioncategories2.unsubscribe()
        this.subscriptionCheckCatNr.unsubscribe()
    }

    save(formValue, isValid) {
        this.productService.createProduct({
            name: formValue.nameOfProduct,
            description: formValue.description,
            supplierId: this.supplierId,
            price: formValue.price,
            package: formValue.package,
            categoryIds: [formValue.category],
            catalogNr: formValue.catalogNr,
            noArticle: formValue.noarticle,
            groupMarch: formValue.groupMarch,
            tva: formValue.tva,
            disabled: formValue.disabled !== '' && formValue.disabled !== null,
            needsLotNumber: formValue.needsLotNumber !== '' && formValue.needsLotNumber !== null,
            isStock: formValue.isStock !== '' && formValue.isStock !== null,
            divisionFactor: +formValue.divisionFactor,
            stockPackage: formValue.stockPackage
        }).subscribe(res => {
            var x = res;
            this.reset();
        });
    }

    reset() {
        this.productForm.reset();
        this.productForm.controls['category'].setValue('-1');
    }

    categoryChanged(categoryId) {
        var category = this.categories.filter(c => c.data._id === categoryId)[0]
        this.productForm.patchValue({ noarticle: category ? category.data.noArticle : '', groupMarch: category ? category.data.groupMarch : '' })
    }
}