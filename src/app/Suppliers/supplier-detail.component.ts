import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from './../Shared/Services/product.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { OrderService } from './../Shared/Services/order.service'
import { DataStore } from './../Shared/Services/data.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-supplier-detail',
        templateUrl: './supplier-detail.component.html'
    }
)
export class SupplierDetailComponent implements OnInit {
    constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private dataStore: DataStore, private productService: ProductService, private orderService: OrderService,
        private router: Router, private authService: AuthService, private navigationService: NavigationService, private supplierService: SupplierService) {

    }

    @ViewChild('sapIdResultPopup') sapIdResultPopup;

    private useVoucherForm: FormGroup;
    private fixCostsForm: FormGroup;

    private supplierObservable: Observable<any>;
    @Input() supplierId: string
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false
    @Input() initialTab: string = 'tabProducts';
    @Output() stateChanged = new EventEmitter();

    private showAdminWebShoppingTab: boolean = true

    private stateInit() {
        if (this.initialTab === '') this.initialTab = 'tabProducts'
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;

        this.showAdminWebShoppingTab = this.initialTab !== 'tabWebShopping'

        //if (!this.state.selectedWebShoppingTabId) this.state.selectedWebShoppingTabId = this.initialTab;        
    }

    private initForms() {
        const priceRegEx = `^\\d+(.\\d*)?$`;

        this.useVoucherForm = this.formBuilder.group({
            description: ['', [Validators.required, Validators.minLength(5)]],
            priceFixCosts: ['', [Validators.required, Validators.pattern(priceRegEx)]]
        });

        this.fixCostsForm = this.formBuilder.group({
            descriptionFixCosts: ['', [Validators.required]],
            priceFixCosts: ['', [Validators.required, Validators.pattern(priceRegEx)]]
        });
    }

    private isPageRunning: boolean= true

    ngOnInit(): void {
        this.stateInit()
        this.initForms()

        this.supplierObservable = this.supplierService.getAnnotatedSupplierById(this.supplierId)

        this.productsObservable = this.productService.getAnnotatedProductsWithBasketInfoBySupplier(this.supplierId);

        this.productsBasketObservable = this.productService.getAnnotatedProductsInCurrentUserBasketBySupplier(this.supplierId);
        this.productsBasketObservable.takeWhile(() => this.isPageRunning).subscribe(products => this.isThereABasket = products && products.length > 0);

        this.productsGroupedBasketObservable = this.productService.getAnnotatedProductsInGroupOrdersUserBasketBySupplier(this.supplierId);
        this.productsGroupedBasketObservable.takeWhile(() => this.isPageRunning).subscribe(products => this.isThereAGroupedBasket = products && products.length > 0);

        this.ordersObservable = this.orderService.getAnnotedOrdersBySupplier(this.supplierId);
        this.orderService.hasSupplierAnyOrder(this.supplierId).takeWhile(() => this.isPageRunning).subscribe(anyOrder => this.anyOrder = anyOrder);
        this.authService.getAnnotatedCurrentUser().takeWhile(() => this.isPageRunning).subscribe(user => {
            this.currentAnnotatedUser = user
        })


        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.supplierObservable.map(supplier => supplier.data.webShopping && supplier.data.webShopping.categoryIds ? supplier.data.webShopping.categoryIds : []);

        this.supplierObservable.takeWhile(() => this.isPageRunning).subscribe(supplier => {
            this.supplier = supplier;
        });

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })
    }

    ngOnDestroy(): void {
        this.isPageRunning= false
    }

    resetFixCosts() {
        this.fixCostsForm.reset();
    }

    saveFixCosts(formValue, isValid) {
        if (!isValid) return
        if (!+formValue.priceFixCosts) return

        if (!this.supplier.data.fixCosts) this.supplier.data.fixCosts = []

        this.supplier.data.fixCosts.push({
            description: formValue.descriptionFixCosts,
            price: +formValue.priceFixCosts
        })

        this.dataStore.updateData('suppliers', this.supplierId, this.supplier.data);
    }

    private authorizationStatusInfo: AuthenticationStatusInfo;

    private productsObservable: Observable<any>;
    private productsBasketObservable: Observable<any>;
    private productsGroupedBasketObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private supplier: any;
    private isThereABasket: boolean = false;
    private isThereAGroupedBasket: boolean = false;
    private anyOrder: boolean;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private currentAnnotatedUser: any;
    private deleted: boolean = false;

    gotoPreOrder() {
        let link = ['/preorder', this.supplierId];
        this.router.navigate(link);
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/supplier', this.supplierId, this.path, this.isRoot)
            return
        }
        if ($event.nextId === 'gotoTop') {
            $event.preventDefault();
            this.navigationService.jumpToTop()
            return
        }

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
        if (!this.supplier.data.webShopping) this.supplier.data.webShopping = {}
        this.supplier.data.webShopping.isEnabled = isEnabled
        this.dataStore.updateData('suppliers', this.supplierId, this.supplier.data);
    }

    categorySelectionChanged(selectedIds: string[]) {
        if (!this.supplier.data.webShopping) this.supplier.data.webShopping = {}
        this.supplier.data.webShopping.categoryIds = selectedIds;
        this.dataStore.updateData('suppliers', this.supplierId, this.supplier.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    nbVouchersOrdered(categoryId): number {
        return this.supplier.annotation.voucherCategoryMap && this.supplier.annotation.voucherCategoryMap.has(categoryId) ? this.supplier.annotation.voucherCategoryMap.get(categoryId).nbVouchersOrdered : 0
    }

    nbVouchersAvailable(categoryId): number {
        return this.supplier.annotation.voucherCategoryMap && this.supplier.annotation.voucherCategoryMap.has(categoryId) ? this.supplier.annotation.voucherCategoryMap.get(categoryId).vouchers.length : 0
    }

    nbVouchersOrderedUpdated(categoryId, nbOrdered) {
        if (!this.currentAnnotatedUser.data.voucherRequests) this.currentAnnotatedUser.data.voucherRequests = []
        let request = this.currentAnnotatedUser.data.voucherRequests.filter(request => request.supplierId === this.supplierId && request.categoryId === categoryId)[0]
        if (!request) {
            if (nbOrdered === 0) return
            request = {
                supplierId: this.supplierId,
                categoryId: categoryId
            }
            this.currentAnnotatedUser.data.voucherRequests.push(request)
        }
        if (nbOrdered === 0) {
            let index = this.currentAnnotatedUser.data.voucherRequests.findIndex(req => req === request)
            this.currentAnnotatedUser.data.voucherRequests.splice(index, 1)
        }
        request.quantity = nbOrdered
        this.dataStore.updateData('users.krino', this.currentAnnotatedUser.data._id, this.currentAnnotatedUser.data)
    }

    private voucherUseError: string = undefined
    private sapId: string = undefined

    save(formValue, isValid, supplierId, categoryId) {
        this.voucherUseError = undefined
        if (isValid) {
            this.productService.useVoucherForCurrentUser(supplierId, categoryId, formValue.price, formValue.description).subscribe(res => {
                if (res.error) {
                    this.voucherUseError = res.error
                }
                if (res.sapId) {
                    this.sapId = res.sapId
                    const modalRef = this.modalService.open(this.sapIdResultPopup, { keyboard: true, backdrop: false, size: "lg" });
                }
            })
        }
    }

    reset() {
        this.useVoucherForm.reset();
    }

    costsPriceUpdated(costsObject, price) {
        costsObject.price = +price;
        this.dataStore.updateData('suppliers', this.supplierId, this.supplier.data);
    }

    costsDescriptionUpdated(costsObject, description) {
        costsObject.description = description;
        this.dataStore.updateData('suppliers', this.supplierId, this.supplier.data);
    }

    deleteFixCost(costsObject, deleted: boolean) {
        costsObject.deleted = true;
        this.dataStore.updateData('suppliers', this.supplierId, this.supplier.data);
    }

}
