import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service';
import { NavigationService } from './../Shared/Services/navigation.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { DataStore } from './../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Params, Router } from '@angular/router'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product',
        templateUrl: './product.component.html'
    }
)
export class ProductComponent implements OnInit, OnDestroy {
    constructor(private dataStore: DataStore, private navigationService: NavigationService, private productService: ProductService, private authService: AuthService, 
                        private router: Router) { }

    private subscrProduct: Subscription;

    ngOnInit(): void {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.data.categoryIds);

        this.selectableManipsObservable = this.productService.getSelectableManips();
        this.selectedManipIdsObservable = this.productObservable.map(product => product.data.manipIds);

        this.subscrProduct = this.productObservable.subscribe(product => {
            this.product = product;
        });
    }

    ngOnDestroy(): void {
        this.subscrProduct.unsubscribe()
    }


    @ViewChild('prix') priceChild;

    @Input() productObservable: Observable<any>;
    @Input() config;
    @Input() path: string
    private product;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;

    private selectableManipsObservable: Observable<any>;
    private selectedManipIdsObservable: Observable<any>;


    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }


    // =======================
    // Feedback from controls
    // =======================

    descriptionUpdated(desc: string) {
        if (this.product.data.name !== desc) {
            this.product.data.name = desc;
            this.productService.updateProduct(this.product.data);
        }
    }

    prixUpdated(prix: string) {
        var p: number = +prix && (+prix) >= 0 ? +prix : -1;
        if (p !== -1) {
            if (this.product.price !== p) {
                this.product.data.price = p;
                this.productService.updateProduct(this.product.data);
            }
        }
        else {
            this.priceChild.resetContent(this.product.data.price);
        }
    }

    categorySelectionChanged(selectedIds: string[]) {
        this.product.data.categoryIds = selectedIds;
        this.productService.updateProduct(this.product.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    manipSelectionChanged(selectedIds: string[]) {
        this.product.data.manipIds = selectedIds;
        this.productService.updateProduct(this.product.data);
    }

    quantityBasketUpdated(quantity: string) {
        this.productService.doBasketUpdate(this.product, quantity)
    }

    navigateToProduct() {
        this.navigationService.maximizeOrUnmaximize('/product', this.product.data._id, this.path, false)
    }
}