import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ApiService } from './api.service'
import { OtpChoiceService } from './otp-choice.service'
import { OrderService } from './order.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class ProductService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService,
        @Inject(ApiService) private apiService: ApiService, @Inject(OtpChoiceService) private otpChoiceService: OtpChoiceService,
        @Inject(OrderService) private orderService: OrderService) { }

    // categories
    // ==========

    getSelectableCategories(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('Categories').map(categories => {
            return categories.sort((cat1, cat2) => {return cat1.Description < cat2.Description ? -1 : 1;}).map(category =>
                new SelectableData(category._id, category.Description)
            )
        });
    }

    createCategory(newCategory): void {
        this.dataStore.addData('Categories', { 'Description': newCategory });
    }

    getAnnotatedCategories() : Observable<any>
    {
        return Observable.combineLatest(this.getAnnotatedProducts(), this.dataStore.getDataObservable('Categories'), this.dataStore.getDataObservable('otps'),
            (productsAnnotated: any[], categories, otps: any[]) => {
                return categories.map(category => {
                    let suppliersInCategory= productsAnnotated.filter(product => product.data.Categorie && product.data.Categorie.includes(category._id)).map(product =>  product.annotation.supplierName)
                                            .reduce((a: any[], b: string) => {   //take distincs
                                                if (a.indexOf(b) < 0) a.push(b); 
                                                return a;
                                            }, []).slice(0, 2);
                    let otpInCategory= otps.filter(otp => otp.Categorie && otp.Categorie.includes(category._id)).map(otp => otp.Name)
                                            .reduce((a: any[], b: string) => {   //take distincs
                                                if (a.indexOf(b) < 0) a.push(b); 
                                                return a;
                                            }, []).slice(0, 2);

                    return {
                        data: category,
                        annotation: {
                            supplierNames: suppliersInCategory,
                            otpNames: otpInCategory
                        }
                    };
                })
            } );
    }


    // products
    // ========

    updateProduct(product): void {
        this.dataStore.updateData('Produits', product._id, product);
    }

    createProduct(product): Observable<any> {
        return this.dataStore.addData('Produits', product);
    }

    getProductsBySupplier(supplierId): Observable<any> {
        return this.dataStore.getDataObservable('Produits').map(produits => produits.filter(produit => produit.Supplier === supplierId));
    }

    getAnnotedProductsBySupplier(supplierId): Observable<any> {
        return Observable.combineLatest(this.getProductsBySupplier(supplierId), this.getBasketItemsForCurrentUser(),
            (products, basketItems) => {
                return products.map(product => {
                    let basketItemFiltered = basketItems.filter(item => item.produit === product._id);
                    return {
                        data: product,
                        annotation: {
                            basketId: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0]._id : null,
                            quantity: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0].quantity : 0
                        }
                    };
                });
            }
        );
    }

    getAnnotatedProducts() : Observable<any>
    {
        return Observable.combineLatest(this.dataStore.getDataObservable("Produits"), this.dataStore.getDataObservable("Suppliers"),
            (produits, suppliers) => {
                return produits.map(produit => {
                    let supplier= suppliers.filter(supplier => supplier._id === produit.Supplier)[0];
                    return {
                        data: produit,
                        annotation: {
                            supplierName: supplier ? supplier.Nom : "unknown"
                        }
                    };
                });
            }
        );
    }

    // basket
    // ======

    //    get basket
    //    ==========


    hasSupplierBasketItems(supplier, produits, basketitems: any[]): boolean {
        return produits.filter(produit => produit.Supplier === supplier._id).filter(produit => basketitems.map(item => item.produit).includes(produit._id)).length > 0;
    }

    getBasketItemsForCurrentUser(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('basket'),
            this.authService.getUserIdObservable(),
            (basket, userId) => {
                return basket.filter(basketItem => basketItem.user === userId);
            }
        );
    }

    getAnnotedProductsInBasketBySupplier(supplierId): Observable<any>   // getAnnoted results cannot be used to resave into database
    {
        return Observable.combineLatest(this.getProductsBySupplier(supplierId), this.getBasketItemsForCurrentUser(), this.orderService.getAnnotatedOtps(),
            (products, basketItems, otps) => {
                return products.filter(product => basketItems.map(item => item.produit).includes(product._id))
                    .map(product => {
                        let basketItemFiltered = basketItems.filter(item => item.produit === product._id);
                        return basketItemFiltered && basketItemFiltered.length > 0 ? {
                            data: product,
                            annotation: {
                                basketId: basketItemFiltered[0]._id,
                                quantity: basketItemFiltered[0].quantity,
                                totalPrice: product.Prix * basketItemFiltered[0].quantity * 1.21,  // Todo Tva service
                                otp: this.otpChoiceService.determineOtp(product, basketItemFiltered[0].quantity, otps)
                            }
                        } : null;
                    });
            }
        );
    }

    //     modify basket
    //     =============

    createBasketItem(product, quantity: number) {
        this.dataStore.addData('basket', { user: this.authService.getUserId(), produit: product._id, quantity: quantity });
    }

    updateBasketItem(basketItemId, product, quantity: number) {
        this.dataStore.updateData('basket', basketItemId, { user: this.authService.getUserId(), produit: product._id, quantity: quantity });
    }

    removeBasketItem(basketItemId) {
        this.dataStore.deleteData('basket', basketItemId);
    }

    //     create order from basket
    //     ========================

    private passCommand(record): Observable<any> {
        var obs = this.apiService.callWebService('passOrder', record).map(res => res.json());

        obs.subscribe(res => {
            this.dataStore.triggerDataNext('basket');
            this.dataStore.triggerDataNext('orders');
        });
        return obs;
    }


    createOrderFromBasket(products, supplierId): Observable<any> {   // return an observable with the db id of new order 
        if (!products || products.length < 1) return null;

        if (products.filter(product => !product.annotation.otp._id).length > 0) return null;

        var record = {
            data: {
                userId: this.authService.getUserId(),
                equipeId: this.authService.getEquipeId(),
                supplierId: supplierId,
                items: products.filter(product => product.annotation.quantity > 0).map(product => {
                    return {
                        product: product.data._id,
                        quantity: product.annotation.quantity,
                        otp: product.annotation.otp._id,
                        total: product.annotation.totalPrice
                    };
                })
            },
            basketItems: products.filter(product => product.annotation.quantity > 0).map(product => product.annotation.basketId)
        };

        return this.passCommand(record);
    }
}
