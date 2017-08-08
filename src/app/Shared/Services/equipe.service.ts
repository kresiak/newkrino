import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { UserService } from './user.service'
import { OtpService } from './otp.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'
import * as utilsKrino from './../Utils/krino'


Injectable()
export class EquipeService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService, @Inject(UserService) private userService: UserService,
                @Inject(OtpService) private otpService: OtpService) { }


    private getTotalOfOrder(order): number {
        return order.items && order.items.length > 0 ? order.items.map(item => item.total).reduce((a, b) => a + b) : 0;
    }

    private getTotalOfOrders(orders): number {
        return orders.length === 0 ? 0 : orders.map(order => this.getTotalOfOrder(order)).reduce((a, b) => a + b);
    }

    private getTotalOfVoucherOrders(orders): number {
        return orders.length === 0 ? 0 : orders.filter(order => order.shopping).map(order => +order.shopping.total).reduce((a, b) => a + b, 0);
    }

    private getTotalOfFridgeOrders(orders, products): number {
        return orders.length === 0 ? 0 : orders.filter(order => order.isDelivered).map(order => {
            let product = products.filter(p => p._id === order.productId)[0]
            return product ? +product.price * order.quantity : 0
        }).reduce((a, b) => a + b, 0);
    }

    private getTotalOfStockOrders(orders, products, stockItems): number {
        return orders.length === 0 ? 0 : orders.filter(order => order.isProcessed && order.stockItemIds).map(order => {
            let product = products.filter(p => p._id === order.productId)[0]
            let stockItem = stockItems.filter(item => item._id === order.stockItemIds[0])[0]
            return product && stockItem ? (+product.price / +stockItem.divisionFactor) * +order.quantity : 0
        }).reduce((a, b) => a + b, 0);
    }


    // equipes
    // =======

    private createBilanForEquipe(equipeId, orders: any[], ordersFridge: any[], ordersStock: any[], ordersVoucher: any[], products: any[], stockItems: any[]) {
        let ordersFiltered = orders.filter(order => order.equipeId === equipeId);
        let ordersFridgeFiltered = ordersFridge.filter(order => order.equipeId === equipeId);
        let ordersStockFiltered = ordersStock.filter(order => order.equipeId === equipeId);
        let ordersVoucherFiltered = ordersVoucher.filter(order => order.shopping && order.shopping.equipeId === equipeId);

        return {
            totalOrders: this.getTotalOfOrders(ordersFiltered),
            totalFridgeOrders: this.getTotalOfFridgeOrders(ordersFridgeFiltered, products),
            totalVoucherOrders: this.getTotalOfVoucherOrders(ordersVoucherFiltered),
            totalStockOrders: this.getTotalOfStockOrders(ordersStockFiltered, products, stockItems)
        }
    }

    getBilanForEquipe(equipeId) {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('orders'),
            this.dataStore.getDataObservable('orders.fridge'),
            this.dataStore.getDataObservable('orders.stock'),
            this.dataStore.getDataObservable('orders.vouchers'),
            this.dataStore.getDataObservable('products'),
            this.dataStore.getDataObservable('products.stock'),
            (orders: any[], ordersFridge: any[], ordersStock: any[], ordersVoucher: any[], products: any[], stockItems: any[]) => {
                return this.createBilanForEquipe(equipeId, orders, ordersFridge, ordersStock, ordersVoucher, products, stockItems)
            });
    }

    private createAnnotatedEquipe(equipe, orders: any[], otps: any[], dashlets: any[]) {
        if (!equipe) return null;

        let ordersFiltered = orders.filter(order => order.equipeId === equipe._id);
        let otpsFiltered = otps.filter(otp => otp.data.equipeId === equipe._id);
        let budget = otpsFiltered && otpsFiltered.length > 0 ? otpsFiltered.map(otp => otp.annotation.budget).reduce((a, b) => a + b) : 0;
        let amountAvailable = otpsFiltered && otpsFiltered.length > 0 ? otpsFiltered.map(otp => otp.annotation.amountAvailable).reduce((a, b) => a + b) : 0;
        let amountSpent = budget - amountAvailable
        let dashlet = dashlets.filter(dashlet => dashlet.id === equipe._id);

        return {
            data: equipe,
            annotation:
            {
                amountSpent: amountSpent,
                budget: budget,
                amountAvailable: amountAvailable, // budget - amountSpent,
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        };
    }

    getAnnotatedEquipes(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('orders'),
            this.otpService.getAnnotatedOtpsForBudget(),
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

    getAnnotatedCurrentEquipe(): Observable<any> {
        return this.getAnnotatedEquipes().map(equipes => equipes.filter(eq => eq.data._id === this.authService.getEquipeId())[0])
    }


    private getAnnotatedEquipesOfCurrentUser(): Observable<any> {
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

    getEquipesForAutocomplete() {
        return this.dataStore.getDataObservable('equipes').map(equipes => equipes.map(eq => {
            return {
                id: eq._id,
                name: eq.name
            }
        }));
    }


    // equipes groups
    // ==============

    private createAnnotatedEquipeGroup(group, equipes) {
        if (!group) return null;
        let weightSum = group.equipeIds.reduce((acc, idObj) => acc + idObj.weight, 0)

        return {
            data: group,
            annotation:
            {
                equipesTxt: group.equipeIds.reduce((acc, idObj) => {
                    let equipe = equipes.filter(eq => eq._id === idObj.id)[0]
                    if (equipe) acc = acc + (acc === '' ? '' : ', ') + equipe.name
                    return acc
                }, ''),
                equipes: group.equipeIds.map(idObj => {
                    let equipe = equipes.filter(eq => eq._id === idObj.id)[0]
                    return {
                        data: idObj,
                        annotation: {
                            equipe: equipe ? equipe.name : 'unknown equipe',
                            pc: idObj.weight / weightSum * 100
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

        let equipeGiving = equipes.filter(eq => eq._id === gift.equipeGivingId)[0]
        let equipeTaking = equipes.filter(eq => eq._id === gift.equipeTakingId)[0]
        let user = annotatedUsers.filter(user => user.data._id === gift.userId)[0]

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



}