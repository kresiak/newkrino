import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { OrderService } from './order.service'
import { StockService } from './stock.service'
import { VoucherService } from './voucher.service'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"

Injectable()
export class NotificationService {

    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService,
        @Inject(OrderService) private orderService: OrderService, 
        @Inject(StockService) private stockService: StockService, @Inject(VoucherService) private voucherService: VoucherService) {

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


    private getAnnotatedRecentLogs(nbHours: number): Observable<any> {
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


    // messages
    // ==============

    private createAnnotatedMessage(message, annotatedUsers) {
        if (!message) return null;

        let user = annotatedUsers.filter(user => user.data._id === message.userId)[0]

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



}