import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ApiService } from './api.service'
import { OtpChoiceService } from './otp-choice.service'
import { OrderService } from './order.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"


Injectable()
export class ProductService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService,
        @Inject(ApiService) private apiService: ApiService, @Inject(OtpChoiceService) private otpChoiceService: OtpChoiceService,
        @Inject(OrderService) private orderService: OrderService) {
        this.initProductDoubleObservable()
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


    // stock
    // ==========

    private createAnnotatedStockProduct(productStock, products, suppliers, unprocessedStockOrders, currentUserId) {
        if (!productStock) return null;
        let product = products.filter(p => p._id === productStock.productId)[0]
        if (!product) return
        let supplier = suppliers.filter(s => s._id === product.supplierId)[0]

        let nbSold = !productStock.sales ? 0 : productStock.sales.reduce((acc, sale) => acc + sale.quantity, 0);
        let nbReservedByMe = unprocessedStockOrders.filter(order => order.productId === productStock.productId && order.userId === currentUserId).map(order => +order.quantity).reduce((a, b) => {
            return a + b
        }, 0)
        return {
            data: productStock,
            annotation: {
                supplier: supplier ? supplier.name : 'unknown supplier',
                product: product.name + ' ' + productStock.package,
                nbInitialInStock: productStock.quantity,
                lotNb: productStock.lotNumber,
                nbSold: nbSold,
                nbAvailable: productStock.quantity - nbSold,
                nbReservedByMe: nbReservedByMe
            }
        };
    }

    getAnnotatedStockProducts(productsStockObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(productsStockObservable, this.dataStore.getDataObservable('products'), this.dataStore.getDataObservable('suppliers'),
            this.dataStore.getDataObservable('orders.stock'), this.authService.getUserIdObservable(), (productsStock, products, suppliers, stockOrders, currentUserId) => {
                let unprocessedStockOrders = stockOrders.filter(order => !order.isProcessed)
                return productsStock.map(productStock => this.createAnnotatedStockProduct(productStock, products, suppliers, unprocessedStockOrders, currentUserId));
            });
    }

    private getAnnotatedAvailableStockProducts(productsStockObservable: Observable<any>): Observable<any> {
        return this.getAnnotatedStockProducts(productsStockObservable)
            .map(annotatedStockProducts => annotatedStockProducts.filter(annotatedStockProduct => annotatedStockProduct && annotatedStockProduct.annotation.nbAvailable > 0));
    }

    getAnnotatedAvailableStockProductsByProduct(productId): Observable<any> {
        return this.getAnnotatedAvailableStockProducts(this.dataStore.getDataObservable('products.stock').map(stockProducts => stockProducts.filter(sp => sp.productId === productId)));
    }

    getAnnotatedAvailableStockProductsAll(): Observable<any> {
        return this.getAnnotatedAvailableStockProducts(this.dataStore.getDataObservable('products.stock')).map(sps => sps.groupBy(sp => sp.data.productId));
    }

    getNbAvailableInStockByProduct(): Observable<any> {
        return this.getAnnotatedAvailableStockProductsAll().map(groups =>
            groups.map(group => {
                return {
                    productId: group.key,
                    nbAvailable: group.values.reduce((acc, stockItem) => acc + stockItem.annotation.nbAvailable, 0)
                }
            }));
    }


    // Stock orders
    // ============

    private createAnnotatedStockOrder(orderStock, equipes, annotatedUsers, products, stockItems) {
        if (!orderStock) return null;

        var orderProcessItems: any[] = []
        stockItems.filter(item => orderStock.stockItemIds && orderStock.stockItemIds.includes(item._id)).forEach(item => {
            item.sales.filter(itemSale => itemSale.stockOrderId === orderStock._id).forEach(itemSale => {
                orderProcessItems.push({
                    date: itemSale.date,
                    quantity: itemSale.quantity,
                    lotNb: item.lotNumber
                })
            })
        })

        let equipe = equipes.filter(equipe => equipe._id === orderStock.equipeId)[0];
        let user = annotatedUsers.filter(user => user.data._id === orderStock.userId)[0];
        let product = products.filter(product => product._id === orderStock.productId)[0];
        return {
            data: orderStock,
            annotation: {
                product: product ? product.name + ' / ' + (product.stockPackage || product.package) : 'unknown product',
                user: user ? user.annotation.fullName : 'unknown User',
                equipe: equipe ? equipe.name : 'unknown equipe',
                orderProcessItems: orderProcessItems
            }
        };
    }

    getAnnotatedStockOrders(ordersStockObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(ordersStockObservable, this.dataStore.getDataObservable('equipes'), this.authService.getAnnotatedUsers(), this.dataStore.getDataObservable('products'),
            this.dataStore.getDataObservable('products.stock'),
            (ordersStock, equipes, annotatedUsers, products, stockItems, annotatedOrders) => {
                return ordersStock.map(orderStock => this.createAnnotatedStockOrder(orderStock, equipes, annotatedUsers, products, stockItems)).sort((v1, v2) => {
                    var d1 = moment(v1.data.dateCreation, 'DD/MM/YYYY HH:mm:ss').toDate()
                    var d2 = moment(v2.data.dateCreation, 'DD/MM/YYYY HH:mm:ss').toDate()
                    return d1 > d2 ? -1 : 1
                });
            });
    }

    getAnnotatedStockOrdersAll(): Observable<any> {
        return this.getAnnotatedStockOrders(this.dataStore.getDataObservable('orders.stock'))
    }

    getAnnotatedStockOrdersByCurrentUser(): Observable<any> {
        var stockOrdersObservable = Observable.combineLatest(this.dataStore.getDataObservable('orders.stock'), this.authService.getUserIdObservable(), (orders, userId) => {
            return orders.filter(order => order.userId === userId)
        })
        return this.getAnnotatedStockOrders(stockOrdersObservable)
    }

    getAnnotatedStockOrdersByUser(userId): Observable<any> {
        var stockOrdersObservable = this.dataStore.getDataObservable('orders.stock').map(orders => orders.filter(order => order.userId === userId))
        return this.getAnnotatedStockOrders(stockOrdersObservable)
    }

    getAnnotatedStockOrdersByEquipe(equipeId): Observable<any> {
        var stockOrdersObservable = this.dataStore.getDataObservable('orders.stock').map(orders => orders.filter(order => order.equipeId === equipeId))
        return this.getAnnotatedStockOrders(stockOrdersObservable)
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

    private getAnnotatedProductsWithBasketInfo(productsObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(productsObservable, this.getBasketItemsForCurrentUser(), this.dataStore.getDataObservable("suppliers"),
            this.orderService.getProductFrequenceMapObservable(), this.authService.getUserIdObservable(), this.getProductDoubleObservable(),
            (products, basketItems, suppliers, productFrequenceMap, currentUserId, setProductsInDouble) => {
                let mapSuppliers = suppliers.reduce((map, supplier) => {
                    map.set(supplier._id, supplier)
                    return map
                }, new Map());
                return products.map(product => {
                    if (!product.divisionFactor || !(+product.divisionFactor) || (+product.divisionFactor) < 0) product.divisionFactor = 1
                    let supplier = mapSuppliers.get(product.supplierId) //suppliers.filter(supplier => supplier._id === product.supplierId)[0];
                    let basketItemFiltered = basketItems.filter(item => item.produit === product._id);
                    return {
                        data: product,
                        annotation: {
                            basketId: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0]._id : null,
                            hasCurrentUserPermissionToShop: !product.userIds || product.userIds.includes(currentUserId),
                            quantity: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0].quantity : 0,
                            supplierName: supplier ? supplier.name : "unknown",
                            productFrequence: productFrequenceMap.get(product._id) || 0,
                            multipleOccurences: setProductsInDouble.has(product.catalogNr)
                        }
                    };
                });
            }
        );
    }

    getAnnotatedProductsWithBasketInfoAll(): Observable<any> {
        return this.getAnnotatedProductsWithBasketInfo(this.dataStore.getDataObservable('products')).map(prods =>
            prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence));
    }

    getAnnotatedProductsWithBasketInfoById(id: string): Observable<any> {
        return this.getAnnotatedProductsWithBasketInfoAll().map(products => products.filter(product => product.data._id === id)[0]);
    }

    getAnnotatedProductsWithBasketInfoByCatalogNr(catalogNr: string): Observable<any> {
        return this.getAnnotatedProductsWithBasketInfoAll().map(products => products.filter(product => product.data.catalogNr === catalogNr));
    }

    getAnnotatedProductsWithBasketInfoBySupplier(supplierId): Observable<any> {
        return this.getAnnotatedProductsWithBasketInfo(this.getProductsBySupplier(supplierId)).map(prods => prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence)).publishReplay(1).refCount();
    }

    getAnnotatedProductsWithBasketInfoByCategory(categoryId): Observable<any> {
        return this.getAnnotatedProductsWithBasketInfo(this.getProductsByCategory(categoryId)).map(prods => prods.sort((a, b) => b.annotation.productFrequence - a.annotation.productFrequence));
    }

    getAnnotatedProductsBoughtByCurrentUserWithBasketInfo(): Observable<any> {
        let productsObservable = this.getProductsBoughtByUser(this.authService.getUserIdObservable(), this.dataStore.getDataObservable('orders'));
        return this.getAnnotatedProductsWithBasketInfo(productsObservable).publishReplay(1).refCount();
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

    // web shopping
    // ============

    // return map suppliedId => {
    //          supplierName: string,
    //          categoryMap: categoryId: string => {
    //                  categoryName: string,
    //                  nbVouchersOrdered: number,
    //                  vouchers: array of vouchers as in database
    //              }    
    //     }

    getVoucherMapForCurrentUser(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('users.krino'),
            this.dataStore.getDataObservable('categories'),
            this.dataStore.getDataObservable('suppliers'),
            this.dataStore.getDataObservable('orders.vouchers'),
            this.authService.getUserIdObservable(),
            (users, categories, suppliers, vouchers, userId) => {
                let user = users.filter(user => user._id === userId)[0]
                let supplierMap = new Map()
                if (!user) return null;

                var initMapIfNecessary = function (supplierId, categoryId) {
                    if (!supplierMap.has(supplierId)) {
                        supplierMap.set(supplierId, {
                            supplierName: suppliers.filter(supplier => supplier._id === supplierId)[0] || 'unknown supplier',
                            categoryMap: new Map()
                        })
                    }
                    let categoryMap = supplierMap.get(supplierId)['categoryMap']
                    if (!categoryMap.has(categoryId)) {
                        categoryMap.set(categoryId, {
                            categoryName: categories.filter(category => category._id === categoryId)[0] || 'unknown category',
                            nbVouchersOrdered: 0,
                            vouchers: []
                        })
                    }
                };

                (user.voucherRequests || []).forEach(request => {
                    initMapIfNecessary(request.supplierId, request.categoryId)
                    supplierMap.get(request.supplierId)['categoryMap'].get(request.categoryId)['nbVouchersOrdered'] = request.quantity
                })

                vouchers.filter(voucher => !voucher.shopping && voucher.userId === userId).forEach(voucher => {
                    initMapIfNecessary(voucher.supplierId, voucher.categoryId)
                    supplierMap.get(voucher.supplierId)['categoryMap'].get(voucher.categoryId)['vouchers'].push(voucher)
                })

                return supplierMap
            }
        );
    }

    getOpenRequestedVouchers(): Observable<any[]> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('users.krino'),
            this.dataStore.getDataObservable('categories'),
            this.dataStore.getDataObservable('suppliers'),
            (users, categories, suppliers) => {
                let list = []

                users.filter(user => user.voucherRequests && user.voucherRequests.filter(req => req.quantity > 0).length > 0).forEach(user => {
                    user.voucherRequests.forEach(request => {
                        if (request.quantity > 0) {
                            let supplier = suppliers.filter(supplier => supplier._id === request.supplierId)[0]
                            let category = categories.filter(category => category._id === request.categoryId)[0]
                            list.push({
                                userId: user._id,
                                userName: user.firstName + ' ' + user.name,
                                supplierId: request.supplierId,
                                supplierName: supplier ? supplier.name : 'unknown supplier',
                                categoryId: request.categoryId,
                                categoryName: category ? category.name : 'unknown category',
                                quantity: request.quantity
                            })
                        }
                    })
                })

                return list.sort((a1, a2) => {
                    if (a1.supplierName === a2.supplierName) {
                        return a1.categoryName < a2.categoryName ? -1 : 1
                    }
                    return a1.supplierName < a2.supplierName ? -1 : 1
                })
            }
        );
    }

    public createVoucher(record): Observable<any> {
        this.dataStore.setLaboNameOnRecord(record)
        var obs = this.apiService.callWebService('createVoucher', record).map(res => res.json());

        obs.subscribe(res => {
            //this.dataStore.triggerDataNext('users.krino');
            //this.dataStore.triggerDataNext('orders.vouchers');
        });
        return obs;
    }

    public useVoucherForCurrentUser(supplierId: string, categoryId: string, amount: number, description: string): Observable<any> {
        let record = {
            userId: this.authService.getUserId(),
            equipeId: this.authService.getEquipeId(),
            supplierId: supplierId,
            categoryId: categoryId,
            amount: amount,
            description: description
        }

        var obs = this.apiService.callWebService('useVoucher', record).map(res => res.json());

        obs.subscribe(res => {
            //if (!res.error)                this.dataStore.triggerDataNext('orders.vouchers');
        });
        return obs;
    }



    private createAnnotatedVoucher(voucher, users: any[], categories: any[], suppliers: any[], equipes: any[]) {
        if (!voucher) return null;

        let user = users.filter(user => user._id === voucher.userId)[0]
        let category = categories.filter(category => category._id === voucher.categoryId)[0]
        let supplier = suppliers.filter(supplier => supplier._id === voucher.supplierId)[0]
        let equipe = !voucher.shopping ? null : equipes.filter(equipe => equipe._id === voucher.shopping.equipeId)[0]

        return {
            data: voucher,
            annotation:
            {
                user: user ? user.firstName + ' ' + user.name : 'unknown user',
                category: category ? category.name : 'unknown category',
                supplier: supplier ? supplier.name : 'unknown supplier',
                isUsed: voucher.shopping ? true : false,
                isInSap: voucher.shopping && voucher.shopping.isSapUpdated,
                status: !voucher.shopping ? 'available' : (voucher.shopping.isSapUpdated ? 'used' : 'used/tell Sap'),
                equipe: equipe ? equipe.name : 'not yet equipe'
            }
        }
    }

    getAnnotatedVouchers(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('orders.vouchers'),
            this.dataStore.getDataObservable('users.krino'),
            this.dataStore.getDataObservable('categories'),
            this.dataStore.getDataObservable('suppliers'),
            this.dataStore.getDataObservable('equipes'),
            (vouchers, users, categories, suppliers, equipes) => {
                return vouchers.map(voucher => this.createAnnotatedVoucher(voucher, users, categories, suppliers, equipes))
            });
    }

    getAnnotatedVouchersByCreationDate(): Observable<any> {
        return this.getAnnotatedVouchers().map(vouchers => vouchers.sort((v1, v2) => {
            var d1 = moment(v1.data.dateCreation, 'DD/MM/YYYY HH:mm:ss').toDate()
            var d2 = moment(v2.data.dateCreation, 'DD/MM/YYYY HH:mm:ss').toDate()
            return d1 > d2 ? -1 : 1
        }))
    }

    getAnnotatedUsedVouchersByDate(): Observable<any> {
        return this.getAnnotatedVouchers().map(vouchers => vouchers.filter(voucher => voucher.annotation.isUsed).sort((v1, v2) => {
            var d1 = moment(v1.data.shopping.date, 'DD/MM/YYYY HH:mm:ss').toDate()
            var d2 = moment(v2.data.shopping.date, 'DD/MM/YYYY HH:mm:ss').toDate()
            return d1 > d2 ? -1 : 1
        }))
    }

    getAnnotatedUsedVouchersOfCurrentUserByDate(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedUsedVouchersByDate(), this.authService.getUserIdObservable(), (vouchers, userId) => {
            return vouchers.filter(voucher => voucher.data.userId === userId)
        })
    }

    getAnnotatedUsedVouchersOfUserByDate(userId): Observable<any> {
        return this.getAnnotatedUsedVouchersByDate().map(vouchers => vouchers.filter(v => v.data.userId === userId))
    }

    getAnnotatedUsedVouchersOfEquipeByDate(equipeId): Observable<any> {
        return this.getAnnotatedUsedVouchersByDate().map(vouchers => vouchers.filter(v => v.data.shopping && v.data.shopping.equipeId === equipeId))
    }

    getAnnotatedUsedVouchersReadyForSap(): Observable<any> {
        return this.getAnnotatedVouchers().map(vouchers => vouchers.filter(voucher => voucher.annotation.isUsed && !voucher.annotation.isInSap))
    }






    // basket
    // ======

    //    get basket
    //    ==========


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

    private hashMapFactory = list => {
        return list.reduce((map, p) => {
            map.set(p._id, p)
            return map
        }, new Map())
    }

    private getAnnotatedProductsInUserBasketBySupplier(supplierId, basketObservable: Observable<any>, otpNeeded: boolean): Observable<any> {
        return Observable.combineLatest(this.getProductsBySupplier(supplierId).map(this.hashMapFactory), basketObservable, 
                otpNeeded ? this.orderService.getAnnotatedOtpsForBudgetMap() : this.emptyObservable(),
                this.authService.getUserIdObservable(), this.authService.getEquipeIdObservable(),
                this.dataStore.getDataObservable('equipes'), this.authService.getAnnotatedUsers(),
            (products, basketItems, otpsBudgetMap, currentUserId, currentEquipeId, equipes, annotatedUsers) => {
                return basketItems.filter(item => products.has(item.produit)).map(basketItemFiltered => {
                    let product= products.get(basketItemFiltered.produit)
                    return {
                            data: product,
                            annotation: {
                                basketId: basketItemFiltered._id,
                                basketData: basketItemFiltered,
                                basketItems: !basketItemFiltered.items ? [] : basketItemFiltered.items.map(item => {
                                    let user= annotatedUsers.filter(user => user.data._id === item.userId)[0]
                                    let equipe= equipes.filter(eq => eq._id === item.equipeId)[0]
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
        return Observable.combineLatest(this.orderService.getAnnotatedFridgeOrders(), this.getAnnotatedStockOrdersAll(), this.getOpenRequestedVouchers(), this.getAnnotatedUsedVouchersReadyForSap(),
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
            var item= {
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
                    var obj: any= {
                        productId: product.data._id,
                        quantity: product.annotation.quantity,
                        otpId: product.annotation.otp._id,
                        total: product.annotation.totalPrice
                    };
                    if (product.annotation.basketData.items) {
                        obj.detail= product.annotation.basketData.items
                    }
                    return  obj
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
