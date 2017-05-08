import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from './../Shared/Services/product.service'
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
                private router: Router, private authService: AuthService, private navigationService: NavigationService) {

    }

    @ViewChild('sapIdResultPopup') sapIdResultPopup;

    private useVoucherForm: FormGroup;
    private fixCostsForm: FormGroup;

    @Input() supplierObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false
    @Input() initialTab: string = 'tabProducts';
    @Output() stateChanged = new EventEmitter();

    private showAdminWebShoppingTab: boolean = true

    private stateInit() {
        if (this.initialTab==='') this.initialTab='tabProducts' 
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;

        this.showAdminWebShoppingTab = this.initialTab !== 'tabWebShopping'

        //if (!this.state.selectedWebShoppingTabId) this.state.selectedWebShoppingTabId = this.initialTab;        
    }

    ngOnInit(): void {
        this.stateInit();

        const priceRegEx = `^\\d+(.\\d*)?$`;

        this.useVoucherForm = this.formBuilder.group({
            description: ['', [Validators.required, Validators.minLength(5)]],
            priceFixCosts: ['', [Validators.required, Validators.pattern(priceRegEx)]]
        });

        this.fixCostsForm = this.formBuilder.group({
            descriptionFixCosts: ['', [Validators.required]],
            priceFixCosts: ['', [Validators.required, Validators.pattern(priceRegEx)]]
        });

        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.supplierObservable.map(supplier => supplier.data.webShopping && supplier.data.webShopping.categoryIds ? supplier.data.webShopping.categoryIds : []);

        this.subscriptionSupplier= this.supplierObservable.subscribe(supplier => {
            this.supplier = supplier;
            if (supplier) {
                this.productsObservable = this.productService.getAnnotatedProductsWithBasketInfoBySupplier(supplier.data._id);

                this.productsBasketObservable = this.productService.getAnnotatedProductsInCurrentUserBasketBySupplier(supplier.data._id);
                this.subscriptionIsBasket= this.productsBasketObservable.subscribe(products => this.isThereABasket = products && products.length > 0);

                this.productsGroupedBasketObservable = this.productService.getAnnotatedProductsInGroupOrdersUserBasketBySupplier(supplier.data._id);
                this.subscriptionIsGroupedBasket= this.productsGroupedBasketObservable.subscribe(products => this.isThereAGroupedBasket = products && products.length > 0);

                this.ordersObservable = this.orderService.getAnnotedOrdersBySupplier(supplier.data._id);
                this.subscriptionAnyOrder= this.orderService.hasSupplierAnyOrder(supplier.data._id).subscribe(anyOrder => this.anyOrder = anyOrder);
                this.subscriptionCurrentUser= this.authService.getAnnotatedCurrentUser().subscribe(user => {
                    this.currentAnnotatedUser = user
                })
            }
        });

        this.subscriptionAuthorization= this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        })        
    }

    ngOnDestroy(): void {
         this.subscriptionAuthorization.unsubscribe()
         this.subscriptionSupplier.unsubscribe()
         this.subscriptionIsBasket.unsubscribe()
         this.subscriptionIsGroupedBasket.unsubscribe()
         this.subscriptionAnyOrder.unsubscribe()
         this.subscriptionCurrentUser.unsubscribe()
    }
    
    resetFixCosts() {
        this.fixCostsForm.reset();
    }

    saveFixCosts(formValue, isValid) {
        if (!isValid) return
        if (!+formValue.priceFixCosts) return

        if (!this.supplier.data.fixCosts) this.supplier.data.fixCosts= []

        this.supplier.data.fixCosts.push({
            description: formValue.descriptionFixCosts,
            price: +formValue.priceFixCosts
        })
            
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    }

    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription     
    private subscriptionSupplier: Subscription    

    private subscriptionIsBasket: Subscription
    private subscriptionIsGroupedBasket: Subscription
    private subscriptionAnyOrder: Subscription
    private subscriptionCurrentUser: Subscription

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

    gotoPreOrder() {
        let link = ['/preorder', this.supplier.data._id];
        this.router.navigate(link);
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/supplier', this.supplier.data._id, this.path, this.isRoot)
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
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    }

    categorySelectionChanged(selectedIds: string[]) {
        if (!this.supplier.data.webShopping) this.supplier.data.webShopping = {}
        this.supplier.data.webShopping.categoryIds = selectedIds;
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
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
        let request = this.currentAnnotatedUser.data.voucherRequests.filter(request => request.supplierId === this.supplier.data._id && request.categoryId === categoryId)[0]
        if (!request) {
            if (nbOrdered === 0) return
            request = {
                supplierId: this.supplier.data._id,
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

    private voucherUseError: string= undefined
    private sapId: string= undefined

    save(formValue, isValid, supplierId, categoryId) {
        this.voucherUseError= undefined
        if (isValid) {
            this.productService.useVoucherForCurrentUser(supplierId, categoryId, formValue.price, formValue.description).subscribe(res => {
                if (res.error) {
                    this.voucherUseError= res.error
                }          
                if (res.sapId){
                    this.sapId= res.sapId
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
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    }

    costsDescriptionUpdated(costsObject, description) {
        costsObject.description = description;     
        this.dataStore.updateData('suppliers', this.supplier.data._id, this.supplier.data);
    }

    deleteFixCost(costsObject) {
       
    }
}
