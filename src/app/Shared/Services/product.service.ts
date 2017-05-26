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




    // basket
    // ======

    //    get basket
    //    ==========

    getBasketProductsSetForCurrentUser(): Observable<any> {
        return this.getBasketItemsForUser(this.authService.getUserIdObservable()).map(list => {
            return list.reduce((map, p) => {
                map.set(p.produit, p)
                return map
            }, new Map())
        })
    }



    getBasketItemsForCurrentUser(): Observable<any> {
        return this.getBasketItemsForUser(this.authService.getUserIdObservable())
    }

    getBasketItemsForGroupOrdersUser(): Observable<any> {
        return this.getBasketItemsForUser(this.authService.getGroupOrdersUserIdObservable())
    }

    private getBasketItemsForUser(userIdObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('basket'),
            userIdObservable,
            (basket, userId) => {
                return basket.filter(basketItem => basketItem.user === userId);
            }
        );
    }

    getBasketItemsForGroupOrdersUserWithCurrentUserParticipation(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('basket'),
            this.authService.getGroupOrdersUserIdObservable(),
            this.authService.getUserIdObservable(),
            (basket, groupOrdersUserId, currentUserId) => {
                return basket.filter(basketItem => basketItem.user === groupOrdersUserId && basketItem.items && basketItem.items.map(item => item.userId).includes(currentUserId));
            }
        );
    }

    private emptyObservable(): Observable<any> {
        return Observable.from([[]])         // we need the double [[]]   the emptyobservable has to return a first value. Otherwise combineLatest gets stuck
    }

    private getAnnotatedProductsInUserBasketBySupplier(supplierId, basketObservable: Observable<any>, otpNeeded: boolean): Observable<any> {
        return Observable.combineLatest(this.getProductsBySupplier(supplierId).map(utils.hashMapFactory), basketObservable,
            otpNeeded ? this.otpService.getAnnotatedOtpsForBudgetMap() : this.emptyObservable(),
            this.authService.getUserIdObservable(), this.authService.getEquipeIdObservable(),
            this.dataStore.getDataObservable('equipes'), this.authService.getAnnotatedUsers(),
            (products, basketItems, otpsBudgetMap, currentUserId, currentEquipeId, equipes, annotatedUsers) => {
                return basketItems.filter(item => products.has(item.produit)).map(basketItemFiltered => {
                    let product = products.get(basketItemFiltered.produit)
                    return {
                        data: product,
                        annotation: {
                            basketId: basketItemFiltered._id,
                            basketData: basketItemFiltered,
                            basketItems: !basketItemFiltered.items ? [] : basketItemFiltered.items.map(item => {
                                let user = annotatedUsers.filter(user => user.data._id === item.userId)[0]
                                let equipe = equipes.filter(eq => eq._id === item.equipeId)[0]
                                return {
                                    data: item,
                                    annotation: {
                                        userFullName: user ? user.annotation.fullName : 'unknown user',
                                        equipe: equipe ? equipe.name : 'unknown equipe'
                                    }
                                }
                            }),
                            hasCurrentUserPermissionToShop: !product.userIds || product.userIds.includes(currentUserId),
                            quantity: basketItemFiltered.quantity,
                            totalPrice: product.price * basketItemFiltered.quantity * (1 + (product.tva == 0 ? 0 : product.tva || 21) / 100),  // Todo Tva service
                            otp: basketItemFiltered.otpId ? { name: 'will never be used, or?', _id: basketItemFiltered.otpId } :
                                otpNeeded ? this.otpChoiceService.determineOtp(product, basketItemFiltered.quantity, otpsBudgetMap, currentEquipeId) : null
                        }
                    }
                })
            }
        );
    }


    getAnnotatedProductsInCurrentUserBasketBySupplier(supplierId): Observable<any>   // getAnnoted results cannot be used to resave into database
    {
        return this.getAnnotatedProductsInUserBasketBySupplier(supplierId, this.getBasketItemsForCurrentUser(), false)
    }

    getAnnotatedProductsInGroupOrdersUserBasketBySupplier(supplierId): Observable<any>   // getAnnoted results cannot be used to resave into database
    {
        return this.getAnnotatedProductsInUserBasketBySupplier(supplierId, this.getBasketItemsForGroupOrdersUser(), false)
    }

    getAnnotatedProductsInCurrentUserBasketBySupplierWithOtp(supplierId): Observable<any>   // getAnnoted results cannot be used to resave into database
    {
        return this.getAnnotatedProductsInUserBasketBySupplier(supplierId, this.getBasketItemsForCurrentUser(), true)
    }

    /*    getAnnotatedProductsInGroupOrdersUserBasketBySupplierWithOtp(supplierId): Observable<any>   // getAnnoted results cannot be used to resave into database
        {
            return this.getAnnotatedProductsInUserBasketBySupplier(supplierId, this.getBasketItemsForGroupOrdersUser(), true)        
        }
    */


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


    //     modify basket
    //     =============

    doBasketOtpUpdate(product, otpId: string) {
        this.dataStore.updateData('basket', product.annotation.basketId, { user: this.authService.getUserId(), produit: product.data._id, quantity: product.annotation.quantity, otpId: otpId });
    }


    doBasketUpdate(productAnnotated, quantity: string) {
        var q: number = +quantity && (+quantity) >= 0 ? +quantity : 0;
        if (!productAnnotated.annotation.basketId && q > 0) {
            this.createBasketItem(productAnnotated.data, q);
        }
        if (productAnnotated.annotation.basketId && q === 0) {
            this.removeBasketItem(productAnnotated.annotation.basketId);
        }
        if (productAnnotated.annotation.basketId && q > 0 && q !== productAnnotated.annotation.quantity) {
            this.updateBasketItem(productAnnotated.annotation.basketId, productAnnotated.data, q);
        }
    }

    doBasketNotUrgent(productAnnotated): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable('basket'), (basket) => {
            var groupOrderUserId = this.authService.systemGroupUserId
            var nonUrgentBasketItem = basket.filter(item => item.user === groupOrderUserId && item.produit === productAnnotated.data._id)[0]
            let now = moment().format('DD/MM/YYYY HH:mm:ss')
            var item = {
                date: now,
                userId: this.authService.getUserId(),
                equipeId: this.authService.getEquipeId(),
                quantity: productAnnotated.annotation.quantity
            }

            if (nonUrgentBasketItem) {
                if (!nonUrgentBasketItem.items) nonUrgentBasketItem.items = []
                nonUrgentBasketItem.items.push(item)
                nonUrgentBasketItem.quantity += productAnnotated.annotation.quantity
                this.dataStore.updateData('basket', nonUrgentBasketItem._id, nonUrgentBasketItem)
            }
            else {
                this.dataStore.addData('basket', {
                    user: groupOrderUserId,
                    produit: productAnnotated.data._id,
                    quantity: productAnnotated.annotation.quantity,
                    items: [item]
                })
            }
            this.removeBasketItem(productAnnotated.annotation.basketId)
        })
    }

    private createBasketItem(product, quantity: number) {
        this.dataStore.addData('basket', { user: this.authService.getUserId(), produit: product._id, quantity: quantity });
    }

    private updateBasketItem(basketItemId, product, quantity: number) {
        this.dataStore.updateData('basket', basketItemId, { user: this.authService.getUserId(), produit: product._id, quantity: quantity });
    }

    private removeBasketItem(basketItemId) {
        this.dataStore.deleteData('basket', basketItemId);
    }


    //     create order from basket
    //     ========================


    private logOrderRecord(record) {
        let data = record.data
        var total = data.items.map(item => item.total).reduce((a, b) => +a + +b, 0)

        this.dataStore.addData('orders.log', {
            type: 'user',
            amount: +total,
            id: data.userId,
            orderId: data._id
        })

        if (data.equipeId) {
            this.dataStore.addData('orders.log', {
                type: 'equipe',
                amount: +total,
                id: data.equipeId,
                orderId: data._id
            })
        }

        if (data.equipeRepartition) {
            this.dataStore.addData('orders.log', {
                type: 'group',
                amount: +total,
                id: data.equipeRepartition.equipeGroupId,
                orderId: data._id
            })
        }

        data.items.filter(item => item.otpId).reduce((map, item) => {
            if (!map.has(item.otpId)) map.set(item.otpId, 0)
            map.set(item.otpId, map.get(item.otpId) + item.total)
            return map
        }, new Map()).forEach((value, key) => {
            this.dataStore.addData('orders.log', {
                type: 'otp',
                amount: +value,
                id: key,
                orderId: data._id
            })
        })

        data.items.filter(item => item.categoryId).reduce((map, item) => {
            if (!map.has(item.categoryId)) map.set(item.categoryId, 0)
            map.set(item.categoryId, map.get(item.categoryId) + item.total)
            return map
        }, new Map()).forEach((value, key) => {
            this.dataStore.addData('orders.log', {
                type: 'category',
                amount: +value,
                id: key,
                orderId: data._id
            })
        })

    }

    private passCommand(record): Observable<any> {
        this.dataStore.setLaboNameOnRecord(record.data)
        var obs = this.apiService.callWebService('passOrder', record).map(res => res.json());

        obs.combineLatest(this.dataStore.getDataObservable('products'), (res, products) => {
            record.data._id = res._id
            record.data.items.forEach(item => {
                let product = products.filter(p => p._id === item.productId)[0]
                if (product && product.categoryIds && product.categoryIds[0]) {
                    item.categoryId = product.categoryIds[0]
                }
            })
            return record
        }).first().subscribe(rec => {
            this.logOrderRecord(rec)
        });
        return obs;
    }




    createOrderFromBasket(products, supplierId, equipeGroup): Observable<any> {   // return an observable with the db id of new order 
        if (!products || products.length < 1) return null;

        if (products.filter(product => !product.annotation.otp._id).length > 0) return null;

        var record = {
            data: {
                userId: this.authService.getUserId(),
                //equipeId: this.authService.getEquipeId(),
                supplierId: supplierId,
                items: products.filter(product => product.annotation.quantity > 0).map(product => {
                    var obj: any = {
                        productId: product.data._id,
                        quantity: product.annotation.quantity,
                        otpId: product.annotation.otp._id,
                        total: product.annotation.totalPrice
                    };
                    if (product.annotation.basketData.items) {
                        obj.detail = product.annotation.basketData.items
                    }
                    return obj
                })
            },
            basketItems: products.filter(product => product.annotation.quantity > 0).map(product => product.annotation.basketId)
        };

        if (equipeGroup) {
            record.data['equipeRepartition'] = { equipeGroupId: equipeGroup.data._id }
            record.data['equipeRepartition']['repartition'] = equipeGroup.annotation.equipes.map(eq => {
                return {
                    equipeId: eq.data.id,
                    weight: eq.annotation.pc
                }
            })
        }
        else {
            record.data['equipeId'] = this.authService.getEquipeId()
        }

        return this.passCommand(record);
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
