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


    getSelectableManips(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('manips').map(manips => {
            return manips.sort((cat1, cat2) => { return cat1.name < cat2.name ? -1 : 1; }).map(manip =>
                new SelectableData(manip._id, manip.name)
            )
        });
    }

    // stock
    // ==========

    private createAnnotatedStockProduct(productStock, annotatedOrders: any[]) {
        if (!productStock) return null;
        let annotatedOrder = annotatedOrders.filter(order => order.data._id === productStock.orderId)[0];
        if (!annotatedOrder) return null;
        let annotatedOrderItem = annotatedOrder.annotation.items.filter(item => item.data.deliveries && item.data.deliveries.filter(delivery => delivery.stockId === productStock._id).length > 0)[0];
        if (!annotatedOrderItem) return null;
        let delivery = annotatedOrderItem.data.deliveries.filter(delivery => delivery.stockId === productStock._id)[0];
        if (!delivery) return null;
        let nbSold = !productStock.sales ? 0 : productStock.sales.reduce((acc, sale) => acc + sale.quantity, 0);
        return {
            data: productStock,
            annotation: {
                supplier: annotatedOrder.annotation.supplier,
                product: annotatedOrderItem.annotation.description,
                nbInitialInStock: delivery.quantity,
                lotNb: delivery.lotNb,
                nbSold: nbSold,
                nbAvailable: delivery.quantity - nbSold,
                orderId: annotatedOrder.data._id
            }
        };
    }

    getAnnotatedStockProducts(productsStockObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(productsStockObservable, this.orderService.getAnnotedOrdersFromAll(), (productsStock, annotatedOrders) => {
            return productsStock.map(productStock => this.createAnnotatedStockProduct(productStock, annotatedOrders));
        });
    }

    getAnnotatedAvailableStockProducts(productsStockObservable: Observable<any>): Observable<any> {
        return this.getAnnotatedStockProducts(productsStockObservable)
            .map(annotatedStockProducts => annotatedStockProducts.filter(annotatedStockProduct => annotatedStockProduct && annotatedStockProduct.annotation.nbAvailable > 0));
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
        return this.getAnnotatedCategories().map(categories=> categories.filter(s => {
            return s.data._id===id
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

    getAnnotatedProductsWithBasketInfo(productsObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(productsObservable, this.getBasketItemsForCurrentUser(), this.dataStore.getDataObservable("suppliers"), 
                    this.orderService.getProductFrequenceMapObservable(),
            (products, basketItems, suppliers, productFrequenceMap) => {
                let mapSuppliers= suppliers.reduce((map, supplier)=> {
                    map.set(supplier._id, supplier)
                    return map
                }, new Map());
                return products.map(product => {
                    let supplier =  mapSuppliers.get(product.supplierId) //suppliers.filter(supplier => supplier._id === product.supplierId)[0];
                    let basketItemFiltered = basketItems.filter(item => item.produit === product._id);
                    return {
                        data: product,
                        annotation: {
                            basketId: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0]._id : null,
                            quantity: basketItemFiltered && basketItemFiltered.length > 0 ? basketItemFiltered[0].quantity : 0,
                            supplierName: supplier ? supplier.name : "unknown",
                            productFrequence: productFrequenceMap.get(product._id) || 0
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
            this.dataStore.getDataObservable('suppliers.vouchers'),
            this.authService.getUserIdObservable(),
            (users, categories, suppliers, vouchers, userId) => {
                let user= users.filter(user => user._id === userId)[0]
                let supplierMap= new Map()
                if (!user) return null;

                var initMapIfNecessary= function(supplierId, categoryId) {
                    if (!supplierMap.has(supplierId)) {
                        supplierMap.set(supplierId, {
                            supplierName: suppliers.filter(supplier => supplier._id === supplierId)[0] || 'unknown supplier',
                            categoryMap: new Map()
                        })
                    }
                    let categoryMap= supplierMap.get(supplierId)['categoryMap']
                    if (!categoryMap.has(categoryId)) {
                        categoryMap.set(categoryId, {
                            categoryName: categories.filter(category => category._id === categoryId)[0] || 'unknown category',
                            vouchers: []
                        })
                    }
                };

                (user.voucherRequests || []).forEach(request => {
                    initMapIfNecessary(request.supplierId, request.categoryId)
                    supplierMap.get(request.supplierId)['categoryMap'].get(request.categoryId)['nbVouchersOrdered']= request.quantity
                })

                vouchers.filter(voucher => voucher.userId === userId).forEach(voucher => {
                    initMapIfNecessary(voucher.supplierId, voucher.categoryId)
                    supplierMap.get(voucher.supplierId)['categoryMap'].get(voucher.categoryId)['vouchers'].push(voucher)
                })

                return supplierMap                
            }
        );        
    }



    // basket
    // ======

    //    get basket
    //    ==========


    hasSupplierBasketItems(supplier, produits, basketitems: any[]): boolean {
        return produits.filter(produit => produit.supplierId === supplier._id).filter(produit => basketitems.map(item => item.produit).includes(produit._id)).length > 0;
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

    getAnnotatedProductsInBasketBySupplier(supplierId): Observable<any>   // getAnnoted results cannot be used to resave into database
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
                                totalPrice: product.price * basketItemFiltered[0].quantity * 1.21,  // Todo Tva service
                                otp: this.otpChoiceService.determineOtp(product, basketItemFiltered[0].quantity, otps)
                            }
                        } : null;
                    });
            }
        );
    }

    //     modify basket
    //     =============

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
