import {Component, Input, OnInit, ViewChildren, QueryList} from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { FormControl, FormGroup } from '@angular/forms'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { OrderService } from './../Shared/Services/order.service';
import { ProductService } from './../Shared/Services/product.service';
import { NavigationService } from './../Shared/Services/navigation.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { Editor} from './../ui/editor/editor'
import { DataStore } from './../Shared/Services/data.service'
import { ActivatedRoute, Params, Router } from '@angular/router'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product-grid',
        templateUrl: './product-grid.component.html'
    }
)
export class ProductGridComponent implements OnInit
{
    @Input() productsObservable: Observable<any>;
    @Input() config;
    @Input() isBasket: boolean= false;
    @Input() isGroupedBasket: boolean= false;
    @Input() path: string = 'products'

    private products;

    constructor(private orderService: OrderService, private dataStore: DataStore, private navigationService: NavigationService, private productService: ProductService, private authService: AuthService,
                        private router: Router)
    {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });        
    }

    searchControl = new FormControl();
    searchForm;
    private subscriptionProducts: Subscription 
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private selectableCategoriesObservable: Observable<any>;
    
    
    private otpListObservable: any
    
    @ViewChildren(Editor) priceChildren : QueryList<Editor>;

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    ngOnInit() : void{
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();

        this.otpListObservable = this.dataStore.getDataObservable('otps').map(otps => otps.map(otp => {
            return {
                id: otp._id,
                name: otp.name
            }
        }));     

        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });        

        this.subscriptionProducts= Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(''), (products, searchTxt: string) => {
            let txt: string = searchTxt.trim().toUpperCase();
            if (txt === '' || txt === '!' || txt === '$' || txt === '$>' || txt === '$<') return products;

            return products.filter(product => {
                if (txt.startsWith('$S/')) {
                    let txt2 = txt.slice(3);
                    return product.data.isStock && (!txt2 || product.data.name.toUpperCase().includes(txt2))                     
                }                
                if (txt.startsWith('!')) {
                    let txt2 = txt.slice(1);
                    return !product.data.name.toUpperCase().includes(txt2) && !product.annotation.supplierName.toUpperCase().includes(txt2)
                }
                if (txt.startsWith('$>') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + product.data.price >= montant;
                }
                if (txt.startsWith('$<') && +txt.slice(2)) {
                    let montant = +txt.slice(2);
                    return + product.data.price <= montant;
                }
                if (txt.startsWith('$M')) {
                    return product.annotation.multipleOccurences;
                }

                if (txt.startsWith('$D')) {
                    return product.data.disabled;
                }

                return product.data.name.toUpperCase().includes(txt)  || (product.data.description||'').toUpperCase().includes(txt) 
            });
        }).subscribe(products => {
            this.products = products.slice(0, 50)
        });
    }

    ngOnDestroy(): void {
        this.subscriptionProducts.unsubscribe()
        this.subscriptionAuthorization.unsubscribe()                 
    }

    getProductObservable(id: string) : Observable<any>
    {
        return this.productsObservable.map(products => products.filter(product => product.data._id === id)[0]);
    }


    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

    getProductCategoryIdsObservable(id: string) : Observable<any>
    {
        return this.productsObservable.map(products => products.filter(product => product.data._id === id)[0].data.categoryIds);
    }

    descriptionUpdated(desc: string, product) {
        if (product.data.name !== desc) {
            product.data.name = desc;
            this.productService.updateProduct(product.data);
        }
    }

    prixUpdated(prix: string, product) {
        var p: number = +prix && (+prix) >= 0 ? +prix : -1;
        if (p !== -1) {
            if (product.price !== p) {
                product.data.price = p;
                this.productService.updateProduct(product.data);
            }
        }
        else {
            var ctrl= this.priceChildren.toArray().filter(editorControl => editorControl.id === product.data._id)[0]
            if (ctrl)                
                ctrl.resetContent(product.data.price);
        }
    }

    categorySelectionChanged(selectedIds: string[], product) {
        product.data.categoryIds = selectedIds;
        this.productService.updateProduct(product.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    quantityBasketUpdated(quantity: string, product) {
        this.productService.doBasketUpdate(product, quantity)
    }

    quantityGroupedBasketUpdated(quantity: string, product, item) {
        if (!+quantity) return
        item.data.quantity=+quantity
        product.annotation.basketData.quantity= (product.annotation.basketData.items || []).reduce((acc,item) => acc + item.quantity, 0)
        this.dataStore.updateData('basket', product.annotation.basketId, product.annotation.basketData)
    }

    navigateToProduct(product) {
        this.navigationService.maximizeOrUnmaximize('/product', product.data._id, this.path, false)
    }

    otpUpdated(newOtpId, product): void {
        if (newOtpId && newOtpId.length > 0) {
            this.productService.doBasketOtpUpdate(product, newOtpId)
        }
    }

    setNotUrgent(product): void {
        this.productService.doBasketNotUrgent(product).first().subscribe(res => {

        })
    }
}