import { Component, Input, OnInit, ViewChild} from '@angular/core';
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
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.data.Categorie);

        this.productObservable.subscribe(product => {
            this.product = product;
        });
    }

    @ViewChild('prix') priceChild;

    @Input() productObservable: Observable<any>;
    @Input() config;
    private product;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

    // =======================
    // Feedback from controls
    // =======================

    descriptionUpdated(desc: string) {
        if (this.product.Description !== desc) {
            this.product.data.Description = desc;
            this.productService.updateProduct(this.product.data);
        }
    }

    prixUpdated(prix: string) {
        var p: number = +prix && (+prix) >= 0 ? +prix : -1;
        if (p !== -1) {
            if (this.product.Prix !== p) {
                this.product.data.Prix = p;
                this.productService.updateProduct(this.product.data);
            }
        }
        else
        {
            this.priceChild.resetContent(this.product.data.Prix);
        }
    }

    categorySelectionChanged(selectedIds: string[]) {
        this.product.data.Categorie = selectedIds;
        this.productService.updateProduct(this.product.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }


    quantityBasketUpdated(quantity: string) {
        var q: number = +quantity && (+quantity) >= 0 ? +quantity : 0;
        if (!this.product.annotation.basketId && q > 0) {
            this.productService.createBasketItem(this.product.data, q);
        }
        if (this.product.annotation.basketId && q === 0) {
            this.productService.removeBasketItem(this.product.annotation.basketId);
        }
        if (this.product.annotation.basketId && q > 0 && q !== this.product.annotation[quantity]) {
            this.productService.updateBasketItem(this.product.annotation.basketId, this.product.data, q);
        }
    }
}