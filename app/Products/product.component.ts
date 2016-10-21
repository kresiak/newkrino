import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service';
import { SelectableData } from './../Shared/Classes/selectable-data'

@Component(
    {
        moduleId: module.id,
        selector: 'gg-product',
        templateUrl: './product.component.html'
    }
)
export class ProductComponent implements OnInit {
    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.Categorie);

        this.productObservable.subscribe(product => {
            this.product = product;            
            this.productService.getBasketItemForCurrentUser(this.product._id).subscribe(
                item => this.basketItem = item
                );
        });
    }

    @Input() productObservable: Observable<any>;
    @Input() config;
    private product;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private basketItem;

    showColumn(columnName: string)
    {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

    // =======================
    // Feedback from controls
    // =======================

    descriptionUpdated(desc: string) {
        if (this.product.Description !== desc)
        {
            this.product.Description = desc;
            this.productService.updateProduct(this.product);
        }
    }

    categorySelectionChanged(selectedIds: string[]) {
        this.product.Categorie = selectedIds;
        this.productService.updateProduct(this.product);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }


    quantityBasketUpdated(quantity: string)
    {
        var q: number= +quantity && (+quantity) >= 0 ? +quantity : 0;
        if (!this.basketItem && q > 0)
        {
            this.productService.createBasketItem(this.product, q);
        }
        if (this.basketItem && q === 0)
        {
            this.productService.removeBasketItem(this.basketItem);
        }
        if (this.basketItem && q > 0 && q !== this.basketItem[quantity])
        {
            this.basketItem.quantity= q;
            this.productService.updateBasketItem(this.basketItem);
        }
    }
}