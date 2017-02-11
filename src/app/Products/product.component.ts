import { Component, Input, OnInit, OnDestroy,  ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service';
import { SelectableData } from './../Shared/Classes/selectable-data'
import { DataStore } from './../Shared/Services/data.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { NgbTabChangeEvent, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product',
        templateUrl: './product.component.html'
    }
)
export class ProductComponent implements OnInit, OnDestroy  {
    constructor(private dataStore: DataStore, private productService: ProductService, private authService: AuthService, private modalService: NgbModal) { }

    private subscrProduct: Subscription ;

    ngOnInit(): void {
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.productObservable.map(product => product.data.categoryIds);

        this.selectableManipsObservable = this.productService.getSelectableManips();
        this.selectedManipIdsObservable = this.productObservable.map(product => product.data.manipIds);

        this.subscrProduct= this.productObservable.subscribe(product => {
            this.product = product;
        });
    }

    ngOnDestroy(): void {
         this.subscrProduct.unsubscribe()
    }


    @ViewChild('prix') priceChild;

    @Input() productObservable: Observable<any>;
    @Input() config;
    private product;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;

    private selectableManipsObservable: Observable<any>;
    private selectedManipIdsObservable: Observable<any>;


    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }


    private saveFridgeOrder(formData) {
        if (+formData.qty < 1) return;

        var data = {
            equipeId: this.authService.getEquipeId(),
            userId: this.authService.getUserId(),
            productId: this.product.data._id,
            quantity: +formData.qty,
            isDelivered: false
        }

        this.dataStore.addData('orders.fridge', data).first().subscribe(res => {
            // todo msg: has been successfully saved
        }, );
    }


    openModal(template) {
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then((data) => {
            this.saveFridgeOrder(data);
        }, (res) => {
        });
        promise.catch((err) => {
        });
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


}