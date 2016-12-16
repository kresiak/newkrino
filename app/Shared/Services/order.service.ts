import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { UserService } from './user.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class OrderService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService, @Inject(UserService) private userService: UserService) { }

    // otps
    // ======

    getSelectableOtps(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('otps').map(otps => {
            return otps.map(otp =>
                new SelectableData(otp._id, otp.name)
            )
        });
    }

    private getOtpMoneySpentMapObservable(): Observable<Map<string, number>> {    // parse the orders in a linear way to create a map otp => money spent    (more performance friendly)
        return this.dataStore.getDataObservable('orders').map(orders => orders.reduce((map, order) => {
            if (order.items) {
                order.items.filter(item => item.otpId && item.total).forEach(item => {
                    let otpId = item.otpId
                    if (!map.has(otpId)) map.set(otpId, 0)
                    map.set(otpId, map.get(otpId) + item.total)
                })
            }
            return map
        }, new Map()))
    }

    private createAnnotatedOtp(otp, otpSpentMap, equipes, dashlets: any[]) {

        if (!otp) return null;
        let amountSpent = otpSpentMap.has(otp._id) ? otpSpentMap.get(otp._id) : 0
        //orders.map(order => !order.items ? 0 : order.items.filter(item => item.otpId === otp._id).map(item => item.total).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
        let equipe = equipes.filter(equipe => equipe._id === otp.equipeId)[0];
        let dashlet = dashlets.filter(dashlet => dashlet.id === otp._id);
        return {
            data: otp,
            annotation: {
                budget: (+(otp.budget)),
                amountSpent: amountSpent,
                amountAvailable: (+(otp.budget)) - amountSpent,
                equipe: equipe ? equipe.name : 'no equipe',
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        }
    }

    getAnnotatedOtps(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('equipes'),
            this.getOtpMoneySpentMapObservable(),
            this.userService.getOtpDashletsForCurrentUser(),
            (otps, equipes, otpSpentMap, dashlets) => {
                return otps.map(otp => this.createAnnotatedOtp(otp, otpSpentMap, equipes, dashlets))
            });
    }

    getAnnotatedOtpsByEquipe(equipeId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => otps.filter(otp => otp.data.equipeId === equipeId));
    }

    getAnnotatedOpenOtpsByCategory(categoryId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => otps.filter(otp => !otp.data.isBlocked && !otp.data.isClosed && otp.data.categoryIds && otp.data.categoryIds.includes(categoryId)));
    }


    getAnnotatedOtpById(otpId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => {
            let otpFiltered = otps.filter(otp => otp.data._id === otpId);
            return otpFiltered.length === 0 ? null : otpFiltered[0];
        });
    }

    // orders
    // ======

    // order helper functions for viewing orders
    // =========================================

    getProductFrequenceMapObservable(): Observable<Map<string, number>> {    // parse the orders in a linear way to create a map product => nb orders    
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

    getSupplierFrequenceMapObservable(): Observable<Map<string, number>> {    // parse the orders in a linear way to create a map supplier => nb orders    
        return this.dataStore.getDataObservable('orders').map(orders => orders.reduce((map, order) => {
            let supplierId = order.supplierId
            if (supplierId) {
                if (!map.has(supplierId)) map.set(supplierId, 0)
                map.set(supplierId, map.get(supplierId) + 1)
            }
            return map
        }, new Map()))
    }

    private getTotalOfOrder(order): number {
        return order.items && order.items.length > 0 ? order.items.map(item => item.total).reduce((a, b) => a + b) : 0;
    }

    private getTotalOfOrders(orders): number {
        return orders.length === 0 ? 0 : orders.map(order => this.getTotalOfOrder(order)).reduce((a, b) => a + b);
    }

    private createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets: any[]) {
        if (!order) return null;
        let supplier = suppliers.get(order.supplierId)
        let equipe = equipes.get(order.equipeId)
        let user = users.get(order.userId)
        let dashlet = dashlets.filter(dashlet => dashlet.id === order._id);
        return {
            data: order,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                supplier: supplier ? supplier.name : 'Unknown supllier',
                equipe: equipe ? equipe.name : 'Unknown equipe',
                total: this.getTotalOfOrder(order),
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined,
                items: !order.items ? [] : order.items.map(item => {
                    let product = products.get(item.productId)
                    let otp = otps.get(item.otpId)
                    return {
                        data: item,
                        annotation: {
                            otp: otp ? otp.name : 'Unknown otp',
                            description: product ? product.name : 'Unknown product',
                            price: product ? product.price : '0',
                            nbDelivered: (item.deliveries || []).reduce((acc, delivery) => acc + (+delivery.quantity), 0),
                            deliveries: (item.deliveries || []).map(delivery => {
                                return {
                                    data: delivery
                                }
                            })
                        }
                    }
                })
            }
        };
    }

    // viewing orders
    // ==============

    private hashMapFactory = list => {
        return list.reduce((map, p) => {
            map.set(p._id, p)
            return map
        }, new Map())
    }

    getAnnotedOrder(id: string): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order._id === id)[0]),
            this.dataStore.getDataObservable('products').map(this.hashMapFactory),
            this.dataStore.getDataObservable('otps').map(this.hashMapFactory),
            this.dataStore.getDataObservable('users.krino').map(this.hashMapFactory),
            this.dataStore.getDataObservable('equipes').map(this.hashMapFactory),
            this.dataStore.getDataObservable('suppliers').map(this.hashMapFactory),
            this.userService.getOrderDashletsForCurrentUser(),
            (order, products, otps, users, equipes, suppliers, dashlets) => {
                return this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets);
            })
    }


    getAnnotedOrders(ordersObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(
            ordersObservable,
            this.dataStore.getDataObservable('products').map(this.hashMapFactory),
            this.dataStore.getDataObservable('otps').map(this.hashMapFactory),
            this.dataStore.getDataObservable('users.krino').map(this.hashMapFactory),
            this.dataStore.getDataObservable('equipes').map(this.hashMapFactory),
            this.dataStore.getDataObservable('suppliers').map(this.hashMapFactory),
            this.userService.getOrderDashletsForCurrentUser(),
            (orders, products, otps, users, equipes, suppliers, dashlets) => {
                return orders.map(order =>
                    this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets)
                );
            })
    }

    getAnnotedOrdersFromAll(): Observable<any> {
        return this.getAnnotedOrders(this.dataStore.getDataObservable('orders'));
    }

    getNewestAnnotedOrders(nb: number): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.sort((a, b) => b.kid - a.kid).slice(0, nb))
        return this.getAnnotedOrders(ordersObservable);
    }

    getAnnotedOrdersBySupplier(supplierId: string): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.supplierId === supplierId)).map(orders => orders.sort((a, b) => b.kid - a.kid))
        return this.getAnnotedOrders(ordersObservable);
    }

    getAnnotedOrdersByProduct(productId: string): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.items && order.items.map(item => item.productId).includes(productId))).map(orders => orders.sort((a, b) => b.kid - a.kid))
        return this.getAnnotedOrders(ordersObservable);
    }

    hasSupplierAnyOrder(supplierId: string): Observable<boolean> {
        return this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.supplierId === supplierId).length > 0)
    }

    getAnnotedOrdersByEquipe(equipeId: string): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.equipeId === equipeId))
        return this.getAnnotedOrders(ordersObservable);
    }

    hasEquipeAnyOrder(equipeId: string): Observable<boolean> {
        return this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.equipeId === equipeId).length > 0);
    }

    getAnnotedOrdersOfCurrentUser(): Observable<any> {
        return this.authService.getUserIdObservable().switchMap(userId => {
            let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.userId === userId))
            return this.getAnnotedOrders(ordersObservable);
        })
    }

    getAnnotedOrdersByOtp(otpId: string): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.items && order.items.map(item => item.otpId).includes(otpId)))
        return this.getAnnotedOrders(ordersObservable);
    }

    hasOtpAnyOrder(otpId: string): Observable<boolean> {
        return this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.items && order.items.map(item => item.otpId).includes(otpId)).length > 0);
    }


    // updating orders
    // ==============

    updateOrder(order): void {
        this.dataStore.updateData('orders', order._id, order);
    }




    // equipes
    // =======

    private createAnnotatedEquipe(equipe, orders: any[], otps: any[], dashlets: any[]) {
        if (!equipe) return null;

        let ordersFiltered = orders.filter(order => order.equipeId === equipe._id);
        let otpsFiltered = otps.filter(otp => otp.equipeId === equipe._id);
        let budget = otpsFiltered && otpsFiltered.length > 0 ? otpsFiltered.map(otp => +otp.budget).reduce((a, b) => a + b) : 0;
        let amountSpent = this.getTotalOfOrders(ordersFiltered);
        let dashlet = dashlets.filter(dashlet => dashlet.id === equipe._id);

        return {
            data: equipe,
            annotation:
            {
                amountSpent: amountSpent,
                budget: budget,
                amountAvailable: budget - amountSpent,
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        };
    }

    getAnnotatedEquipes(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('orders'),
            this.dataStore.getDataObservable('otps'),
            this.userService.getEquipeDashletsForCurrentUser(),
            (equipes, orders, otps, dashlets) => {
                return equipes.map(equipe => this.createAnnotatedEquipe(equipe, orders, otps, dashlets))
            });
    }

    getAnnotatedEquipeById(equipeId): Observable<any> {
        return this.getAnnotatedEquipes().map(equipes => {
            let equipesFiltered = equipes.filter(equipe => equipe.data._id === equipeId);
            return equipesFiltered.length === 0 ? null : equipesFiltered[0];
        });
    }

    getAnnotatedEquipesOfCurrentUser(): Observable<any> {
        return Observable.combineLatest(this.getAnnotatedEquipes(), this.authService.getUserIdObservable(), (equipes, userId) => {
            return equipes.filter(equipe =>
                equipe.data.userIds && equipe.data.userIds.includes(userId));
        });
    }
}