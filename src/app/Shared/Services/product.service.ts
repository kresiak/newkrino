import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ApiService } from './api.service'
import { OtpChoiceService } from './otp-choice.service'
import { OrderService } from './order.service'
import { StockService } from './stock.service'
import { VoucherService } from './voucher.service'
import { OtpService } from './otp.service'
import { SelectableData } from './../Classes/selectable-data'
import { SharedObservable } from './../Classes/shared-observable'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'

Injectable()
export class ProductService {

    private allProductsObservable: SharedObservable

    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService,
        @Inject(ApiService) private apiService: ApiService, @Inject(OtpChoiceService) private otpChoiceService: OtpChoiceService,
        @Inject(OrderService) private orderService: OrderService, @Inject(OtpService) private otpService: OtpService,
        @Inject(StockService) private stockService: StockService, @Inject(VoucherService) private voucherService: VoucherService) {
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
            (productsAnnotated: any[], categories, otps: any[]) => {
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

                    return {
                        data: category,
                        annotation: {
                            supplierNames: suppliersInCategory,
                            otpNames: otpInCategory
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



    private getAnnotatedProducts(productsObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(productsObservable, this.dataStore.getDataObservable("suppliers"),
            this.orderService.getProductFrequenceMapObservable(), this.authService.getUserIdObservable(), this.getProductDoubleObservable(),
            (products, suppliers, productFrequenceMap, currentUserId, setProductsInDouble) => {
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
                            multipleOccurences: setProductsInDouble.has(product.catalogNr)
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


    // orders LM warning
    // ==================

    getLmWarningMessages(): Observable<any> {
        return Observable.combineLatest(this.orderService.getAnnotatedFridgeOrders(), this.stockService.getAnnotatedStockOrdersAll(), 
            this.voucherService.getOpenRequestedVouchers(), this.voucherService.getAnnotatedUsedVouchersReadyForSap(),
            this.getAnnotatedRecentLogs(24), this.getAdminMonitorForCurrentUser(), this.orderService.getAnnotedOrdersByStatus('Received by SAP'), this.orderService.getAnnotedOrdersValidable(),
            (annotatedFridgeOrders, annotatedStockOrders, openRequestVouchers, usedVouchers, logs, adminConfig, classicOrders, validableOrders) => {
                let annotatedFridgeOrdersOk = annotatedFridgeOrders.filter(o => !o.data.isDelivered)
                let annotatedStockOrdersOk = annotatedStockOrders.filter(o => !o.data.isProcessed)

                return {
                    nbTotal: annotatedFridgeOrdersOk.length + annotatedStockOrdersOk.length + openRequestVouchers.length + usedVouchers.length + classicOrders.length + validableOrders.length,
                    fridgeOrders: annotatedFridgeOrdersOk,
                    stockOrders: annotatedStockOrdersOk,
                    requestVouchers: openRequestVouchers,
                    usedVouchers: usedVouchers,
                    classicOrders: classicOrders,
                    validableOrders: validableOrders,
                    equipeMonitors: logs.filter(log => log.data.type === 'equipe' && adminConfig.equipe.ids.includes(log.data.id) && log.data.amount > adminConfig.equipe.amount),
                    otpMonitors: logs.filter(log => log.data.type === 'otp' && adminConfig.otp.ids.includes(log.data.id) && log.data.amount > adminConfig.otp.amount),
                    userMonitors: logs.filter(log => log.data.type === 'user' && adminConfig.user.ids.includes(log.data.id) && log.data.amount > adminConfig.user.amount),
                    categoryMonitors: logs.filter(log => log.data.type === 'category' && adminConfig.category.ids.includes(log.data.id) && log.data.amount > adminConfig.category.amount)
                }
            });
    }

    getAdminMonitorForCurrentUser() {
        return Observable.combineLatest(this.dataStore.getDataObservable('admin.monitor'), this.authService.getUserIdObservable(), (monitorConfigs, currentUserId) => {
            return monitorConfigs.filter(c => c.userId === currentUserId)[0] || {
                userId: currentUserId,
                otp: {
                    ids: [],
                    amount: 1000
                },
                equipe: {
                    ids: [],
                    amount: 1000
                },
                user: {
                    ids: [],
                    amount: 1000
                },
                category: {
                    ids: [],
                    amount: 1000
                }
            }
        })
    }


    getAnnotatedRecentLogs(nbHours: number): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('orders.log'), this.dataStore.getDataObservable('users.krino'), this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('otps'), this.dataStore.getDataObservable('categories'), (logs, users, equipes, otps, categories) => {
                let now = moment()
                let relevantLogs = logs.filter(log => {
                    let date = moment(log.createDate, 'DD/MM/YYYY HH:mm:ss')
                    let diff = now.diff(date, 'hours')
                    return diff <= nbHours
                })

                return relevantLogs.map(log => {
                    var info: string = ''
                    switch (log.type) {
                        case 'otp':
                            let otp = otps.filter(otp => otp._id === log.id)[0]
                            info = otp ? otp.name : 'unknown otp'
                            break
                        case 'user':
                            let user = users.filter(user => user._id === log.id)[0]
                            info = user ? user.firstName + ' ' + user.name : 'unknown user'
                            break
                        case 'equipe':
                            let equipe = equipes.filter(equipe => equipe._id === log.id)[0]
                            info = equipe ? equipe.name : 'unknown equipe'
                            break
                        case 'category':
                            let category = categories.filter(category => category._id === log.id)[0]
                            info = category ? category.name : 'unknown category'
                            break
                    }

                    return {
                        'data': log,
                        'annotation': {
                            info: info
                        }
                    }
                }).sort((v1, v2) => {
                    var d1 = moment(v1.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    var d2 = moment(v2.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    return d1 > d2 ? -1 : 1
                });

            })
        //return this.dataStore.getDataObservable('orders.log')
    }


}
