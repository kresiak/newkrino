import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { UserService } from './user.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription } from 'rxjs/Rx'
import * as moment from "moment"


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

    private mapOldKrinoStatus(id: number){
        var map={
            1: 'Ready',
            2: 'Blocked',
            3: 'Deleted',
            4: 'Received by SAP',
            5: 'Sent to supplier',
            6: 'Partially delivered',
            7: 'Fully delivered',
            9: 'Inconnu',
            10: 'Invoiced',
            15: 'Synchronisé avec SAP',
            33: 'Commanmde interne',
            34: 'Commande Bernadette',
            40: 'Remboursement',
            50: 'Commande au LM',
            60: 'Commande Oligo prête',
            70: 'Sequencing',
            80: 'Frigo -2',
            81: 'Frigo -2 delivered',
            82: 'Engagement sur commande ouverte',
            90: 'Pièce sans engagement'
        }
        if (map[id]) return map[id]
        return 'Unknown status'
    }

    private createAnnotedOrder(order, products, otps, users, equipes, groups, suppliers, dashlets: any[], currentUser) {
        if (!order) return null;
        let supplier = suppliers.get(order.supplierId)
        let equipe = equipes.get(order.equipeId)
        let equipeGroup = !order.equipeRepartition ? null : groups.get(order.equipeRepartition.equipeGroupId)
        let user = users.get(order.userId)
        let dashlet = dashlets.filter(dashlet => dashlet.id === order._id);
        let status= order.status && order.status.value ? order.status.value : (order.oldKrino && order.oldKrino.status ? this.mapOldKrinoStatus(order.oldKrino.status) : '?')
        
        let retObj ={
            data: order,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                supplier: supplier ? supplier.name : 'Unknown supllier',
                status: status,
                isDeletable: status==='created' && currentUser && (order.userId === currentUser.data._id || currentUser.data.isAdmin),
                //equipe: equipe ? equipe.name : 'Unknown equipe',
                total: this.getTotalOfOrder(order),
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined, 
                items: !order.items ? [] : order.items.map(item => {
                    let product = products.get(item.productId)
                    let otp = otps.get(item.otpId) 
                    let nbDelivered= (item.deliveries || []).reduce((acc, delivery) => acc + (+delivery.quantity), 0)
                    return {
                        data: item,
                        annotation: {
                            otp: otp ? otp.name : 'Unknown otp',
                            description: product ? product.name : 'Unknown product',
                            price: product ? product.price : '0',
                            nbDelivered: nbDelivered,
                            allDelivered: item.quantity===nbDelivered,
                            anyDelivered: item.quantity !==0 && nbDelivered != 0,
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

        retObj.annotation['anyDeliveredByNewKrino']= retObj.annotation.items.filter(item => item.annotation.anyDelivered).length > 0
        retObj.annotation['anyDelivered']= (order.oldKrino && order.oldKrino.status===6) || (retObj.annotation.items.filter(item => item.annotation.anyDelivered).length > 0)
        retObj.annotation['allDelivered']= (order.oldKrino && order.oldKrino.status===7) || (retObj.annotation.items.filter(item => !item.annotation.allDelivered).length === 0)

        if (equipe) retObj.annotation['equipe']= equipe.name
        if (equipeGroup) {
            retObj.annotation['equipeGroup']= equipeGroup.name
            retObj.annotation['equipes']= order.equipeRepartition.repartition.map(item => {
                let equipe = equipes.get(item.equipeId)
                return {
                    weight: item.weight,
                    equipe: equipe ? equipe.name : 'unknown equipe'
                }
            })
        }

        return retObj
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
            this.dataStore.getDataObservable('equipes.groups').map(this.hashMapFactory),
            this.dataStore.getDataObservable('suppliers').map(this.hashMapFactory),
            this.userService.getOrderDashletsForCurrentUser(),
            this.authService.getAnnotatedCurrentUser(),
            (order, products, otps, users, equipes, groups, suppliers, dashlets, currentUser) => {
                return this.createAnnotedOrder(order, products, otps, users, equipes, groups, suppliers, dashlets, currentUser);
            })
    }


    getAnnotedOrders(ordersObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(
            ordersObservable,
            this.dataStore.getDataObservable('products').map(this.hashMapFactory),
            this.dataStore.getDataObservable('otps').map(this.hashMapFactory),
            this.dataStore.getDataObservable('users.krino').map(this.hashMapFactory),
            this.dataStore.getDataObservable('equipes').map(this.hashMapFactory),
            this.dataStore.getDataObservable('equipes.groups').map(this.hashMapFactory),
            this.dataStore.getDataObservable('suppliers').map(this.hashMapFactory),
            this.userService.getOrderDashletsForCurrentUser(),
            this.authService.getAnnotatedCurrentUser(),
            (orders, products, otps, users, equipes, groups, suppliers, dashlets, currentUser) => {
                return orders.map(order =>
                    this.createAnnotedOrder(order, products, otps, users, equipes, groups, suppliers, dashlets, currentUser)
                );
            })
    }

    getAnnotedOrdersFromAll(): Observable<any> {
        return this.getAnnotedOrders(this.dataStore.getDataObservable('orders'));
    }

    getAnnotedOrdersWithStockDeliveries(): Observable<any> {
        return this.getAnnotedOrdersFromAll().map(orders => orders.filter(order => order.annotation.anyDeliveredByNewKrino));
    }


    getNewestAnnotedOrders(nb: number): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.sort((a, b) => b.kid - a.kid).slice(0, nb))
        return this.getAnnotedOrders(ordersObservable);
    }

    getAnnotedOrdersByNewest(): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.sort((a, b) => b.kid - a.kid))
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
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.equipeId === equipeId).sort((a, b) => b.kid - a.kid))
        return this.getAnnotedOrders(ordersObservable);
    }

    getAnnotedOrdersByUser(userId: string): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.userId === userId).sort((a, b) => b.kid - a.kid))
        return this.getAnnotedOrders(ordersObservable);
    }

    hasEquipeAnyOrder(equipeId: string): Observable<boolean> {
        return this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.equipeId === equipeId).length > 0);
    }

    getAnnotedOrdersOfCurrentUser(): Observable<any> {
        return this.authService.getUserIdObservable().switchMap(userId => {
            let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.userId === userId).sort((a, b) => b.kid - a.kid))
            return this.getAnnotedOrders(ordersObservable);
        })
    }

    getAnnotedOrdersByOtp(otpId: string): Observable<any> {
        let ordersObservable = this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order.items && order.items.map(item => item.otpId).includes(otpId)).sort((a, b) => b.kid - a.kid))
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

    getAnnotatedEquipesOfUser(userId: string): Observable<any> {
        return this.getAnnotatedEquipes().map(equipes => equipes.filter(eq => eq.data.userIds && eq.data.userIds.includes(userId)));
    }


    getSelectableEquipes(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('equipes').map(equipes => {
            return equipes.map(equipe =>
                new SelectableData(equipe._id, equipe.name)
            )
        });
    }

    // equipes groups
    // ==============

    private createAnnotatedEquipeGroup(group, equipes) {
        if (!group) return null;
        let weightSum= group.equipeIds.reduce((acc, idObj) => acc + idObj.weight, 0)

        return {
            data: group,
            annotation:
            {
                equipesTxt: group.equipeIds.reduce((acc, idObj) =>{
                    let equipe= equipes.filter(eq => eq._id === idObj.id)[0]
                    if (equipe) acc= acc + (acc === '' ? '' : ', ') + equipe.name
                    return acc
                }, ''),
                equipes: group.equipeIds.map(idObj => {
                    let equipe= equipes.filter(eq => eq._id === idObj.id)[0]
                    return {
                        data: idObj,
                        annotation: {
                            equipe: equipe ? equipe.name : 'unknown equipe',
                            pc: idObj.weight/weightSum * 100
                        }
                    }
                })
            }
        };
    }

    getAnnotatedEquipesGroups(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('equipes.groups'),
            (equipes, groups) => {
                return groups.map(group => this.createAnnotatedEquipeGroup(group, equipes))
            });
    }


    // equipes gifts
    // ==============

    private createAnnotatedEquipeGift(gift, equipes, annotatedUsers) {
        if (!gift) return null;

        let equipeGiving= equipes.filter(eq => eq._id===gift.equipeGivingId)[0]
        let equipeTaking= equipes.filter(eq => eq._id===gift.equipeTakingId)[0]
        let user= annotatedUsers.filter(user => user.data._id === gift.userId)[0]

        return {
            data: gift,
            annotation:
            {
                equipeGiving: equipeGiving ? equipeGiving.name : 'unknown equipe',
                equipeTaking: equipeTaking ? equipeTaking.name : 'unknown equipe',
                user: user ? user.annotation.fullName : 'unknown user'
            }
        };
    }

    getAnnotatedEquipesGifts(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('equipes.gifts'),
             this.authService.getAnnotatedUsers(),            
            (equipes, gifts, annotatedUsers) => {
                return gifts.map(gift => this.createAnnotatedEquipeGift(gift, equipes, annotatedUsers))
            });
    }    


    // messages
    // ==============

    private createAnnotatedMessage(message, annotatedUsers) {
        if (!message) return null;

        let user= annotatedUsers.filter(user => user.data._id === message.userId)[0]

        return {
            data: message,
            annotation:
            {
                user: user ? user.annotation.fullName : 'unknown user'
            }
        };
    }

    getAnnotatedMessages(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('messages'),
             this.authService.getAnnotatedUsers(),            
            (messages, annotatedUsers) => {
                return messages.map(message => this.createAnnotatedMessage(message, annotatedUsers)).sort((r1, r2) => {
                    var d1 = moment(r1.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    var d2 = moment(r2.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    return d1 > d2 ? -1 : 1
                });
            });
    }    



    // fridge orders
    // ==============

    private createAnnotatedFridgeOrder(order, products, equipes, annotatedUsers) {
        if (!order) return null;

        let user= annotatedUsers.filter(user => user.data._id === order.userId)[0]
        let equipe= equipes.filter(eq => eq._id === order.equipeId)[0]
        let product= products.filter(p => p._id === order.productId)[0]

        return {
            data: order,
            annotation:
            {
                user: user ? user.annotation.fullName : 'unknown user',
                equipe: equipe ? equipe.name : 'unknown equipe',
                product: product ? product.name + ' ' + product.package : 'unknown product'
            }
        };
    }

    getAnnotatedFridgeOrders(): Observable<any> {
        return Observable.combineLatest(
                this.dataStore.getDataObservable('orders.fridge'),
                this.dataStore.getDataObservable('products'),
                this.dataStore.getDataObservable('equipes'),
                 this.authService.getAnnotatedUsers(),            
            (orders, products, equipes, annotatedUsers) => {
                return orders.map(order => this.createAnnotatedFridgeOrder(order, products, equipes, annotatedUsers)).sort((r1, r2) => {
                    var d1 = moment(r1.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    var d2 = moment(r2.data.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    return d1 > d2 ? -1 : 1
                });
            });
    }    




}


