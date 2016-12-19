import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ProductService } from './../Shared/Services/product.service'
import { AuthService } from './../Shared/Services/auth.service'
import { OrderService } from './../Shared/Services/order.service'
import { DataStore } from './../Shared/Services/data.service'
import { Observable } from 'rxjs/Rx'
import { Router } from '@angular/router';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';


@Component(
    {
        moduleId: module.id,
        selector: 'gg-supplier-detail',
        templateUrl: './supplier-detail.component.html'
    }
)
export class SupplierDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private router: Router, private authService: AuthService) {

    }

    @Input() supplierObservable: Observable<any>;
    @Input() state;
    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
        if (!this.state.selectedWebShoppingTabId) this.state.selectedWebShoppingTabId = this.initialTab;        
    }

    ngOnInit(): void {
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.supplierObservable.map(supplier => supplier.data.webShopping && supplier.data.webShopping.categoryIds ? supplier.data.webShopping.categoryIds : []);        

        this.supplierObservable.subscribe(supplier => {
            this.supplier = supplier;
            if (supplier) {
                this.productsObservable = this.productService.getAnnotatedProductsWithBasketInfoBySupplier(supplier.data._id);
                this.productsBasketObservable = this.productService.getAnnotatedProductsInBasketBySupplier(supplier.data._id);
                this.productsBasketObservable.subscribe(products => this.isThereABasket = products && products.length > 0);
                this.ordersObservable = this.orderService.getAnnotedOrdersBySupplier(supplier.data._id);
                this.orderService.hasSupplierAnyOrder(supplier.data._id).subscribe(anyOrder => this.anyOrder = anyOrder);
                this.authService.getAnnotatedCurrentUser().subscribe(user => {
                    this.currentAnnotatedUser= user
                })
            }
        });
    }


    private productsObservable: Observable<any>;
    private productsBasketObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private supplier: any;
    private isThereABasket: boolean = false;
    private anyOrder: boolean;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private currentAnnotatedUser: any;
    

    gotoPreOrder() {
        let link = ['/preorder', this.supplier.data._id];
        this.router.navigate(link);
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    public beforeWebShoppingTabChange($event: NgbTabChangeEvent) {
        this.state.selectedWebShoppingTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };


    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    webShoppingUpdated(isEnabled) {
        if (! this.supplier.data.webShopping) this.supplier.data.webShopping= {}
        this.supplier.data.webShopping.isEnabled= isEnabled
         this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    }

    categorySelectionChanged(selectedIds: string[]) {
        if (! this.supplier.data.webShopping) this.supplier.data.webShopping= {}
        this.supplier.data.webShopping.categoryIds = selectedIds;
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }
    
    nbVouchersOrdered(categoryId): number {
        return this.supplier.annotation.voucherCategoryMap && this.supplier.annotation.voucherCategoryMap.has(categoryId) ? this.supplier.annotation.voucherCategoryMap.get(categoryId).nbVouchersOrdered : 0
    }

    nbVouchersOrderedUpdated(categoryId, nbOrdered) {
        if (!this.currentAnnotatedUser.data.voucherRequests) return
        let request= this.currentAnnotatedUser.data.voucherRequests.filter(request => request.supplierId === this.supplier.data._id && request.categoryId === categoryId)[0]
        if (! request) {
            if (nbOrdered === 0) return
            request= {
                supplierId: this.supplier.data._id,
                categoryId: categoryId
            }
            this.currentAnnotatedUser.data.voucherRequests.push(request)
        }
        if (nbOrdered === 0) {
            let index= this.currentAnnotatedUser.data.voucherRequests.findIndex(req => req === request)
            this.currentAnnotatedUser.data.voucherRequests.splice(index, 1)
        }
        request.quantity= nbOrdered
        this.dataStore.updateData('users.krino', this.currentAnnotatedUser.data._id, this.currentAnnotatedUser.data)
    }
}