import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ProductService } from './product.service'
import { OrderService } from './order.service'


import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class SupplierService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(ProductService) private productService: ProductService, @Inject(OrderService) private orderService: OrderService, @Inject(AuthService) private authService: AuthService) { }

    getSupplier(supplierId): Observable<any> {
        return this.dataStore.getDataObservable('suppliers').map(suppliers => {
            var x = suppliers.filter(supplier => supplier._id === supplierId);
            return x && x.length > 0 ? x[0] : null;
        })
    }

    getAnnotatedSuppliers(): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('suppliers'), this.dataStore.getDataObservable('products'), this.productService.getBasketItemsForCurrentUser(),
            this.orderService.getSupplierFrequenceMapObservable(), this.productService.getVoucherMapForCurrentUser(), this.dataStore.getDataObservable('categories'),
            (suppliers, produits, basketItems, supplierFrequenceMap, voucherMap, categories) => {
                return suppliers.map(supplier => {
                    return {
                        data: supplier,
                        annotation: {
                            hasBasket: this.productService.hasSupplierBasketItems(supplier, produits, basketItems),
                            supplierFrequence: supplierFrequenceMap.get(supplier._id) || 0,
                            voucherCategoryMap:voucherMap.get(supplier._id) ?  voucherMap.get(supplier._id)['categoryMap'] : undefined,
                            webShopping: {
                                categories: supplier.webShopping && supplier.webShopping.categoryIds ? supplier.webShopping.categoryIds.map(categoryId => {
                                    let category= categories.filter(cat => cat._id === categoryId)[0]
                                    return {
                                        id: categoryId,
                                        name: category ? category.name : 'unknown category'
                                    }
                                }) : []
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

    getAnnotatedWebSuppliers(): Observable<any> {
        return this.getAnnotatedSuppliers().map(annotatedSuppliers => annotatedSuppliers.filter(annotatedSupplier => annotatedSupplier.data.webShopping && annotatedSupplier.data.webShopping.isEnabled))
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

}