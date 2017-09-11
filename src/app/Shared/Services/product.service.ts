import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { SharedObservable } from './../Classes/shared-observable'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'

Injectable()
export class ProductService {

    private allProductsObservable: SharedObservable

    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) {
        this.initProductDoubleObservable()

        this.allProductsObservable = new SharedObservable(this.getAnnotatedProducts(this.dataStore.getDataObservable('products')).map(prods =>
            prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence))
        )

    }


    private productDoubleObservable: ConnectableObservable<any> = null

    private initProductDoubleObservable(): void {
        var toExclude = ['A COM', 'À COM', 'INCONNU', 'UNKNOWN', 'AUCUN', 'AUCUNE']

        this.productDoubleObservable = this.dataStore.getDataObservable('products')
            .map(products => products.filter(p => p.catalogNr && !p.disabled && !toExclude.includes(p.catalogNr.toUpperCase()) && p.catalogNr.length > 3).map(p => p.catalogNr).filter((elem, pos, arr) => arr.indexOf(elem) != pos))
            .map(catNumberList => new Set<string>(catNumberList))
            .publishReplay(1)
        this.productDoubleObservable.connect()
    }

    getProductDoubleObservable(): Observable<any> {
        return this.productDoubleObservable
    }




    // categories
    // ==========

    getSelectableCategories(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('categories').map(categories => {
            return categories.sort((cat1, cat2) => { return cat1.name < cat2.name ? -1 : 1; }).map(category =>
                new SelectableData(category._id, category.name)
            )
        });
    }

    createCategory(newCategory): void {
        this.dataStore.addData('categories', { 'name': newCategory });
    }

    getAnnotatedCategories(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedProductsWithSupplierInfo(), this.dataStore.getDataObservable('categories'), this.dataStore.getDataObservable('otps'),
             this.dataStore.getDataObservable('otp.product.classifications'),
            (productsAnnotated: any[], categories, otps: any[], classifications: any[]) => {
                return categories.map(category => {
                    let suppliersInCategory = productsAnnotated.filter(product => product.data.categoryIds && product.data.categoryIds.includes(category._id)).map(product => product.annotation.supplierName)
                        .reduce((a: any[], b: string) => {   //take distincs
                            if (a.indexOf(b) < 0) a.push(b);
                            return a;
                        }, []).slice(0, 2);
                    let otpInCategory = otps.filter(otp => otp.categoryIds && otp.categoryIds.includes(category._id)).map(otp => otp.name)
                        .reduce((a: any[], b: string) => {   //take distincs
                            if (a.indexOf(b) < 0) a.push(b);
                            return a;
                        }, []).slice(0, 2);
                    let classificationsInCategory = classifications.filter(c => c.categoryIds && c.categoryIds.includes(category._id)).map(c => c.name)
                        .sort((a, b) => a < b ? -1 : 1)


                    return {
                        data: category,
                        annotation: {
                            supplierNames: suppliersInCategory,
                            otpNames: otpInCategory,
                            classificationsTxt: classificationsInCategory.reduce((a,b) => a + (a === '' ? '' : ', ') +  b, ''),
                            nbClassifications: classificationsInCategory.length
                        }
                    };
                })
            });
    }

    getAnnotatedCategoriesById(id: string): Observable<any> {
        return this.getAnnotatedCategories().map(categories => categories.filter(s => {
            return s.data._id === id
        }

        )[0]);
    }

    getAnnotatedCategoriesWithNoClassifcation(): Observable<any> {
        return this.getAnnotatedCategories().map(categories => categories.filter(s => !s.annotation.nbClassifications));
    }


    // products
    // ========

    updateProduct(product): void {
        this.dataStore.updateData('products', product._id, product);
    }

    createProduct(product): Observable<any> {
        return this.dataStore.addData('products', product);
    }

    getProductsBySupplier(supplierId): Observable<any> {
        return this.dataStore.getDataObservable('products').map(produits => produits.filter(produit => produit.supplierId === supplierId));
    }

    getFixCostsBySupplier(supplierId): Observable<any> {
        return this.dataStore.getDataObservable('products').map(produits => produits.filter(produit => produit.supplierId === supplierId && produit.isFixCost && !produit.disabled));
    }


    getProductsByCategory(categoryId): Observable<any> {
        return this.dataStore.getDataObservable('products').map(produits => produits.filter(produit => produit.categoryIds.includes(categoryId)));
    }


    private getProductsBoughtByUser(userIdObservable: Observable<any>, ordersObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('products'), ordersObservable, userIdObservable, (products: any[], orders: any[], userId: string) => {
            let distinctProductIdsByUser: any[] = orders.filter(order => order.userId === userId).reduce((acc: any[], order) => {
                let items: any[] = order.items || [];
                items.forEach(item => {
                    if (!acc.includes(item.productId)) {
                        acc.push(item.productId);
                    }
                });
                return acc;
            }, []);
            return products.filter(product => distinctProductIdsByUser.includes(product._id));
        });
    }


    setBasketInformationOnProducts(basketPorductsMap: Map<string, any>, products: any[]) {
        products.forEach(product => {
            product.annotation.hasBasket = basketPorductsMap.has(product.data._id)
            var basketItem = basketPorductsMap.get(product.data._id)
            product.annotation.basketId = product.annotation.hasBasket ? basketItem._id : null
            product.annotation.quantity = product.annotation.hasBasket ? basketItem.quantity : 0
        })
    }


    private getProductFrequenceMapObservable(): Observable<Map<string, number>> {    // parse the orders in a linear way to create a map product => nb orders    
        return this.dataStore.getDataObservable('orders').map(orders => orders.reduce((map, order) => {
            if (order.items) {
                order.items.filter(item => item.productId && item.quantity).forEach(item => {
                    let productId = item.productId
                    if (!map.has(productId)) map.set(productId, 0)
                    map.set(productId, map.get(productId) + 1)
                })
            }
            return map
        }, new Map()))
    }



    private getAnnotatedProducts(productsObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(productsObservable, this.dataStore.getDataObservable("suppliers"), this.authService.getAnnotatedUsers(),
            this.getProductFrequenceMapObservable(), this.authService.getUserIdObservable(), this.getProductDoubleObservable(),
            (products, suppliers, annotatedUsers, productFrequenceMap, currentUserId, setProductsInDouble) => {
                let mapSuppliers = suppliers.reduce((map, supplier) => {
                    map.set(supplier._id, supplier)
                    return map
                }, new Map());
                return products.map(product => {
                    if (!product.divisionFactor || !(+product.divisionFactor) || (+product.divisionFactor) < 0) product.divisionFactor = 1
                    let supplier = mapSuppliers.get(product.supplierId) //suppliers.filter(supplier => supplier._id === product.supplierId)[0];
                    return {
                        data: product,
                        annotation: {
                            //basketId: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0]._id : null,
                            hasCurrentUserPermissionToShop: !product.userIds || product.userIds.includes(currentUserId),
                            //quantity: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0].quantity : 0,
                            supplierName: supplier ? supplier.name : "unknown",
                            productFrequence: productFrequenceMap.get(product._id) || 0,
                            multipleOccurences: setProductsInDouble.has(product.catalogNr),
                            priceUpdates: (product.priceUpdates || []).map(pu => {
                                let user= annotatedUsers.filter(user => user.data._id === pu.userId)[0]
                                return {
                                    data: pu,
                                    annotation: {
                                        user: user ?  user.annotation.fullName : 'unknown user'
                                    }
                                }
                            })
                        }
                    };
                });
            }
        );
    }



    getAnnotatedProductsAll(): Observable<any> {     // here and product list routable
        return this.allProductsObservable.getObservable()
/*        return this.getAnnotatedProducts(this.dataStore.getDataObservable('products')).map(prods =>
            prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence));
*/    }

    getAnnotatedProductsById(id: string): Observable<any> {   // product detail routable
        return this.getAnnotatedProductsAll().map(products => products.filter(product => product.data._id === id)[0]);
    }

    getAnnotatedProductsByCatalogNr(catalogNr: string): Observable<any> {  // for double products in   product detail and enter
        return this.getAnnotatedProductsAll().map(products => products.filter(product => product.data.catalogNr === catalogNr));
    }

    getAnnotatedProductsBySupplier(supplierId): Observable<any> {   // supplier detai for main product grid
        return this.getAnnotatedProducts(this.getProductsBySupplier(supplierId)).map(prods => prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence)).publishReplay(1).refCount();
    }

    getAnnotatedProductsByCategory(categoryId): Observable<any> {   // category detail
        return this.getAnnotatedProducts(this.getProductsByCategory(categoryId)).map(prods => prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence));
    }

    getAnnotatedProductsBoughtByCurrentUser(): Observable<any> {    // mykrino: list of ordered products by me
        let productsObservable = this.getProductsBoughtByUser(this.authService.getUserIdObservable(), this.dataStore.getDataObservable('orders'));
        return this.getAnnotatedProducts(productsObservable).publishReplay(1).refCount();
    }


    getAnnotatedProductsWithSupplierInfo(): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable("products"), this.dataStore.getDataObservable("suppliers"),
            (produits, suppliers) => {
                return produits.map(produit => {
                    let supplier = suppliers.filter(supplier => supplier._id === produit.supplierId)[0];
                    return {
                        data: produit,
                        annotation: {
                            supplierName: supplier ? supplier.name : "unknown"
                        }
                    };
                });
            }
        );
    }






    //=======================
    // adhoc


    flagStockProducts() {
        var oldIds = [263, 3148, 3150, 284, 4, 3152, 51, 1090, 3937, 97, 220, 3721, 2782, 2778, 1003, 1005, 1006, 3225, 2588, 3919, 3918, 3920, 3921, 2790, 84, 1194, 129, 3667, 497, 130, 3633, 3731, 3732, 3681, 3680, 105, 3783, 170, 2424, 3239, 3141, 3506, 3505, 3504, 3703, 116, 199, 203, 201, 3116, 3678, 3679, 1432, 95, 2739, 2743, 94, 2741, 100, 447, 81, 126, 151, 213, 238, 2393, 3675, 231, 20, 58, 185, 183, 180, 184, 3082, 227, 3085, 3323, 3735, 3344, 3346, 3347, 321, 3033, 3179, 3215, 2982, 3038, 2985, 3871, 93, 798, 92, 2760, 38]

        this.dataStore.getDataObservable('products').map(products => products.filter(product => oldIds.includes(product.oldId))).first().subscribe(products => {
            products.forEach(product => {
                product.isStock = true
                product.divisionFactor = 1
                this.dataStore.updateData('products', product._id, product)
            })
        })

    }




}
