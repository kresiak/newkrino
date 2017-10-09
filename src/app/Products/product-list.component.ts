import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx'
import { ProductService } from './../Shared/Services/product.service'
import { BasketService } from './../Shared/Services/basket.service'
import { ConfigService } from './../Shared/Services/config.service'
import { DataStore } from './../Shared/Services/data.service'
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import * as comparatorsUtils from './../Shared/Utils/comparators'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-product-list',
        templateUrl: './product-list.component.html'
    }
)
export class ProductListComponent implements OnInit {
    @Input() productsObservable: Observable<any>;
    @Input() config;
    @Input() state;
    @Input() path: string = 'products'
    @Input() isForSelection: boolean = false
    @Input() selectedProductIds: string[]= []

    @Output() stateChanged = new EventEmitter();
    @Output() productsSelected = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }

    searchControl = new FormControl();
    searchForm;

    private listName = 'productList'
    private showSearch: boolean = false

    private products;
    private nbHitsShown: number = 15
    private nbHitsIncrement: number = 10
    private nbHits: number
    private nbHitsShownObservable: BehaviorSubject<number> = new BehaviorSubject<number>(this.nbHitsShown)


    constructor(private dataStore: DataStore, private authService: AuthService, private productService: ProductService, private basketService: BasketService, private configService: ConfigService) {
        this.searchForm = new FormGroup({
            searchControl: new FormControl()
        });
    }

    resetSerachControl() {
        this.searchControl.setValue('')
    }

    private authorizationStatusInfo: AuthenticationStatusInfo
    private subscriptionAuthorization: Subscription
    private subscriptionProducts: Subscription

    private basketPorductsMap: Map<string, any> = new Map<string, any>()

    ngOnInit(): void {
        this.selectedProductIdsMap= new Set(this.selectedProductIds)
        this.stateInit();
        var initialSearch = this.configService.listGetSearchText(this.listName)
        if (initialSearch) {
            this.showSearch = true
            this.searchControl.setValue(initialSearch)
        }
        this.nbHitsShownObservable.next(this.nbHitsShown = this.configService.listGetNbHits(this.listName, this.nbHitsShown))


        this.subscriptionProducts = Observable.combineLatest(this.productsObservable, this.searchControl.valueChanges.debounceTime(400).distinctUntilChanged().startWith(initialSearch), (products, searchTxt: string) => {
            this.configService.listSaveSearchText(this.listName, searchTxt)
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
                if (txt.startsWith('$T') && (+txt.slice(2) + 1)) {
                    let montant = +txt.slice(2);
                    return + product.data.tva == montant;
                }

                if (txt.startsWith('$M')) {
                    return !product.data.disabled && product.annotation.multipleOccurences;
                }

                if (txt.startsWith('$D')) {
                    return product.data.disabled;
                }

                if (txt.startsWith('$PR')) {
                    return product.data.isLabo;
                }
                if (txt.startsWith('$PU')) {
                    return !product.data.isLabo;
                }
                if (txt.startsWith('$OR')) {
                    return product.annotation.productFrequence;
                }

                if (txt.startsWith('$V')) {
                    return product.data.onCreateValidation;
                }
                if (this.isForSelection && txt.startsWith('$SE')) {
                    return this.selectedProductIdsMap && this.selectedProductIdsMap.has(product.data._id);
                }

                return product.data.name.toUpperCase().includes(txt) || (product.data.description || '').toUpperCase().includes(txt) || product.annotation.supplierName.toUpperCase().includes(txt) || product.data.catalogNr.toUpperCase().includes(txt)
            });
        }).do(products => {
            this.nbHits = products.length
        })
            .switchMap(products => {
                return this.nbHitsShownObservable.map(nbItems => {
                    return products.slice(0, nbItems)
                })
            }).subscribe(products => {
                if (!comparatorsUtils.softCopy(this.products, products)) {
                    this.products = comparatorsUtils.clone(products)
                }
                this.productService.setBasketInformationOnProducts(this.basketPorductsMap, this.products)
            });

        this.basketService.getBasketProductsSetForCurrentUser().subscribe(basketPorductsMap => {
            this.basketPorductsMap = basketPorductsMap
            this.productService.setBasketInformationOnProducts(this.basketPorductsMap, this.products)
        })

        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })
    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionProducts.unsubscribe()
    }


    getProductObservable(id: string) {
        return this.productsObservable.map(products => products.filter(product => product.data._id === id)[0]);
    }

    showColumn(columnName: string) {
        return !this.config || !this.config['skip'] || !(this.config['skip'] instanceof Array) || !this.config['skip'].includes(columnName);
    }

    // This is typically used for accordions with ngFor, for remembering the open Accordion Panel (see template as well)    
    private beforeAccordionChange($event: NgbPanelChangeEvent) {
        if ($event.nextState) {
            this.state.openPanelId = $event.panelId;
            this.stateChanged.next(this.state);
        }
    };

    // This is typically used for accordions with ngFor and tabsets in the cild component. As the ngFor disposes and recreates the child component, we need a way to remember the opened tab
    private childStateChanged(newState, objectId) {
        this.state[objectId] = newState;
        this.stateChanged.next(this.state);
    }

    private saveFrigoProperty(event, product, isFrigo: boolean) {
        event.preventDefault()
        event.stopPropagation()
        product.data.isFrigo = isFrigo;
        this.dataStore.updateData('products', product.data._id, product.data);
    }

    private moreHits() {
        this.nbHitsShown += this.nbHitsIncrement
        this.configService.listSaveNbHits(this.listName, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }

    private allHits() {
        this.nbHitsShown += this.nbHits
        this.configService.listSaveNbHits(this.listName, this.nbHitsShown)
        this.nbHitsShownObservable.next(this.nbHitsShown)
    }


    private selectedProductIdsMap: Set<string>

    productSelectedInList(event, product, isSelected: boolean) {
        event.preventDefault()
        event.stopPropagation()
        var id=(product.data || {})._id
        if (isSelected && this.selectedProductIdsMap.has(id)) this.selectedProductIdsMap.delete(id)
        if (!isSelected && !this.selectedProductIdsMap.has(id)) this.selectedProductIdsMap.add(id)
        this.productsSelected.next(Array.from(this.selectedProductIdsMap.values()))
    }

    isProductSelected(product) {
        return this.selectedProductIdsMap.has(product.data._id)
    }
}