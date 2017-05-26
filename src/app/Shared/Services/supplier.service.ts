import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { BasketService } from './basket.service'
import { VoucherService } from './voucher.service'
import { OrderService } from './order.service'


import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'

Injectable()
export class SupplierService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(BasketService) private basketService: BasketService,
                @Inject(OrderService) private orderService: OrderService, @Inject(AuthService) private authService: AuthService,
                @Inject(VoucherService) private voucherService: VoucherService) { }

    getSupplier(supplierId): Observable<any> {
        return this.dataStore.getDataObservable('suppliers').map(suppliers => {
            var x = suppliers.filter(supplier => supplier._id === supplierId);
            return x && x.length > 0 ? x[0] : null;
        })
    }

/*    private hasSupplierBasketItems(supplierId, produits, basketitems: any[]): boolean {
        return produits.filter(produit => produit.supplierId === supplierId).filter(produit => basketitems.map(item => item.produit).includes(produit._id)).length > 0;
    }
*/
    private supplierIdsInBasketItems(produitsMap, basketitems: any[]): Set<string> {
        var supplierIdSet = new Set<string>()
        basketitems.forEach(item => {
            var product = produitsMap.get(item.produit)
            if (product && !supplierIdSet.has(product.supplierId)) {
                supplierIdSet.add(product.supplierId)
            }
        })
        return supplierIdSet
    }


    private getSupplierIdsSetObservableInBasketItems(basketItemsObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('products').map(utils.hashMapFactory), basketItemsObservable,
            (productsMap, basketItems) => {
                return this.supplierIdsInBasketItems(productsMap, basketItems)
            })
    }

    getSupplierIdsSetObservableWithBasketForCurrentUser(): Observable<any> {
        return this.getSupplierIdsSetObservableInBasketItems(this.basketService.getBasketItemsForCurrentUser())
    }

    getSupplierIdsSetObservableWithBasketForGroupOrdersUser(): Observable<any> {
        return this.getSupplierIdsSetObservableInBasketItems(this.basketService.getBasketItemsForGroupOrdersUser())
    }

    getSupplierIdsSetObservableWithCurrentUserParticipationInGroupsOrder(): Observable<any> {
        return this.getSupplierIdsSetObservableInBasketItems(this.basketService.getBasketItemsForGroupOrdersUserWithCurrentUserParticipation())
    }

    getAnnotatedSupplierseWithBasketForCurrentUser(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedSuppliers(), this.getSupplierIdsSetObservableWithBasketForCurrentUser(),
                    (annotatedSuppliers, supplierIdsSet) => {
                        return annotatedSuppliers.filter(s => supplierIdsSet.has(s.data._id))
                    })
    }

    getAnnotatedSupplierseWithCurrentUserParticipationInGroupsOrder(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedSuppliers(), this.getSupplierIdsSetObservableWithCurrentUserParticipationInGroupsOrder(),
                    (annotatedSuppliers, supplierIdsSet) => {
                        return annotatedSuppliers.filter(s => supplierIdsSet.has(s.data._id))
                    })
    }


    getAnnotatedSuppliers(): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('products'), this.orderService.getSupplierFrequenceMapObservable(),
            this.voucherService.getVoucherMapForCurrentUser(), this.dataStore.getDataObservable('categories'),
            (suppliers, produits, supplierFrequenceMap, voucherMap, categories) => {
                if (!this.authService.getUserId() || (!this.authService.getEquipeId() && !this.authService.isCurrentUserGroupOrderUser())) return [];

                return suppliers.map(supplier => {
                    let voucherCategoryMap = voucherMap && voucherMap.get(supplier._id) ? voucherMap.get(supplier._id)['categoryMap'] : undefined
                    return {
                        data: supplier,
                        annotation: {
                            supplierFrequence: supplierFrequenceMap.get(supplier._id) || 0,
                            voucherCategoryMap: voucherCategoryMap,
                            webShopping: {
                                categories: supplier.webShopping && supplier.webShopping.categoryIds ? supplier.webShopping.categoryIds.map(categoryId => {
                                    let category = categories.filter(cat => cat._id === categoryId)[0]
                                    return {
                                        id: categoryId,
                                        name: category ? category.name : 'unknown category'
                                    }
                                }) : [],
                                isEnabled: supplier.webShopping && supplier.webShopping.isEnabled,
                                nbTotalVouchers: !voucherCategoryMap ? 0 : Array.from(voucherCategoryMap.values()).reduce((acc, value) => acc + value['vouchers'].length, 0),
                                nbVouchersOrdered: !voucherCategoryMap ? 0 : Array.from(voucherCategoryMap.values()).reduce((acc, value) => acc + value['nbVouchersOrdered'], 0)
                            }
                        }
                    }
                });
            }
        );
    }

    getAnnotatedSuppliersByFrequence(): Observable<any> {
        return this.getAnnotatedSuppliers().map(prods => prods.sort((a, b) => b.annotation.supplierFrequence - a.annotation.supplierFrequence));
    }



    getAnnotatedSupplierById(id: string): Observable<any> {
        return this.getAnnotatedSuppliers().map(suppliers => {
            let supplier = suppliers.filter(s => s.data._id === id)[0];
            return supplier ? supplier : null;
        });
    }

    getAnnotatedSupplierBySapId(sapId: string): Observable<any> {
        return this.getAnnotatedSuppliers().map(suppliers => {
            let supplier = suppliers.filter(s => s.data.sapId === sapId)[0];
            return supplier ? supplier : null;
        });
    }

    getAnnotatedWebSuppliers(): Observable<any> {
        return this.getAnnotatedSuppliers().map(annotatedSuppliers => annotatedSuppliers.filter(annotatedSupplier =>
            annotatedSupplier.data.webShopping && annotatedSupplier.data.webShopping.isEnabled && annotatedSupplier.annotation.webShopping.categories.length > 0))
    }


    /*    getAnnotatedSuppliers2(): Observable<any> {
            return Observable.combineLatest(this.dataStore.getDataObservable('suppliers'),
                (suppliers) => {
                    return suppliers.map(supplier => {
                        return {
                            data: supplier,
                            annotation: {
                                hasBasket: false
                            }
                        }
                    });
                }
            );
        }*/

    getAnnotatedReceptions(): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('orders.reception'),
            (suppliers, receptions) => {
                return receptions.map(reception => {
                    let supplier = suppliers.filter(supplier => supplier._id === reception.supplierId)[0]
                    return {
                        data: reception,
                        annotation: {
                            supplier: supplier ? supplier.name : reception.supplier
                        }
                    }
                }).sort((r1, r2) => {
                    var d1 = moment(r1.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    var d2 = moment(r2.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    return d1 > d2 ? -1 : 1
                });
            }
        );
    }

}