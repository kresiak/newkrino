import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import {UserService} from './user.service'
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
                new SelectableData(otp._id, otp.Name)
            )
        });
    }

    private createAnnotatedOtp(otp, orders, equipes, dashlets: any[])
    {
        if (!otp) return null;
        let amountSpent= orders.map(order => order.items.filter(item => item.otp === otp._id).map(item => item.total).reduce((a, b) => a + b, 0)).reduce((a, b)=> a + b, 0);
        let equipe= equipes.filter(equipe => equipe._id===otp.Equipe)[0];
        let dashlet= dashlets.filter(dashlet => dashlet.id === otp._id);
        return {
            data: otp,
            annotation: {
                budget: (+(otp.Budget)),
                amountSpent: amountSpent,
                amountAvailable: (+(otp.Budget)) - amountSpent, 
                equipe: equipe ? equipe.Name : 'no equipe',
                dashletId:  dashlet.length > 0 ? dashlet[0]._id : undefined 
            }
        }
    }

    getAnnotatedOtps(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('orders'),
            this.userService.getOtpDashletsForCurrentUser(),
            (otps, equipes, orders, dashlets) => {
                return otps.map(otp => this.createAnnotatedOtp(otp, orders, equipes, dashlets))
            });
    }

    getAnnotatedOtpsByEquipe(equipeId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => otps.filter(otp => otp.data.Equipe===equipeId));
    }
    
    getAnnotatedOtpById(otpId) : Observable<any>
    {
        return this.getAnnotatedOtps().map(otps =>
        {
            let otpFiltered= otps.filter(otp => otp.data._id === otpId);
            return otpFiltered.length === 0 ? null : otpFiltered[0];
        }); 
    }

    // orders
    // ======

        // order helper functions for viewing orders
        // =========================================

    private getTotalOfOrder(order): number {
        return order.items && order.items.length > 0 ? order.items.map(item => item.total).reduce((a, b) => a + b) : 0;
    }

    private getTotalOfOrders(orders): number {
        return orders.length === 0 ? 0 : orders.map(order => this.getTotalOfOrder(order)).reduce((a, b) => a + b);
    }

    private createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets: any[]) {
        if (!order) return null;
        let supplier = suppliers.filter(supplier => supplier._id === order.supplierId)[0];
        let equipe = equipes.filter(equipe => equipe._id === order.equipeId)[0];
        let user = users.filter(user => user._id === order.userId)[0];
        let dashlet= dashlets.filter(dashlet => dashlet.id === order._id);
        return {
            data: order,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                supplier: supplier ? supplier.Nom : 'Unknown supllier',
                equipe: equipe ? equipe.Name : 'Unknown equipe',
                total: this.getTotalOfOrder(order),
                dashletId:  dashlet.length > 0 ? dashlet[0]._id : undefined ,
                items: order.items.map(item => {
                    let product = products.filter(product => product._id === item.product)[0];
                    let otp = otps.filter(otp => otp._id === item.otp)[0];
                    return {
                        data: item,
                        annotation: {
                            otp: otp ? otp.Name : 'Unknown otp',
                            description: product ? product.Description : 'Unknown product',
                            price: product ? product.Prix : '0'
                        }
                    }
                })
            }
        };
    }

        // viewing orders
        // ==============

    getAnnotedOrder(id: string): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order._id === id)[0]),
            this.dataStore.getDataObservable('Produits'),
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('krinousers'),
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('Suppliers'),
            this.userService.getOrderDashletsForCurrentUser(),
            (order, products, otps, users, equipes, suppliers, dashlets) => {
                return this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets);
            })
    }

    getAnnotedOrders(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('orders'),
            this.dataStore.getDataObservable('Produits'),
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('krinousers'),
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('Suppliers'),
            this.userService.getOrderDashletsForCurrentUser(),
            (orders, products, otps, users, equipes, suppliers, dashlets) => {
                return orders.map(order =>
                    this.createAnnotedOrder(order, products, otps, users, equipes, suppliers, dashlets)
                );
            })
    }

    getAnnotedOrdersBySupplier(supplierId: string): Observable<any> {
        return this.getAnnotedOrders().map(orders => orders.filter(order => order.data.supplierId === supplierId));
    }

    getAnnotedOrdersByEquipe(equipeId: string): Observable<any> {
        return this.getAnnotedOrders().map(orders => orders.filter(order => order.data.equipeId === equipeId));
    }

    getAnnotedOrdersOfCurrentUser(): Observable<any> {
        return Observable.combineLatest(this.getAnnotedOrders(), this.authService.getUserIdObservable(), (orders, userId) =>
        {
            return orders.filter(order => order.data.userId === userId);
        });        
    }

    getAnnotedOrdersByOtp(otpId: string): Observable<any> {
        return this.getAnnotedOrders().map(orders => orders.filter(order => order.data.items.map(item => item.otp).includes(otpId)));
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
        let otpsFiltered= otps.filter(otp => otp.Equipe === equipe._id);
        let budget= otpsFiltered && otpsFiltered.length > 0 ? otpsFiltered.map(otp => +otp.Budget).reduce((a, b) => a + b) : 0;
        let amountSpent= this.getTotalOfOrders(ordersFiltered);
        let dashlet= dashlets.filter(dashlet => dashlet.id === equipe._id);

        return {
            data: equipe,
            annotation:
            {
                amountSpent: amountSpent,
                budget: budget,
                amountAvailable: budget - amountSpent,
                dashletId:  dashlet.length > 0 ? dashlet[0]._id : undefined 
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

    getAnnotatedEquipeById(equipeId) : Observable<any>
    {
        return this.getAnnotatedEquipes().map(equipes =>
        {
            let equipesFiltered= equipes.filter(equipe => equipe.data._id === equipeId);
            return equipesFiltered.length === 0 ? null : equipesFiltered[0];
        }); 
    }

    getAnnotatedEquipesOfCurrentUser() : Observable<any>
    {
        return Observable.combineLatest(this.getAnnotatedEquipes(), this.authService.getUserIdObservable(), (equipes, userId) => { 
            return equipes.filter(equipe => 
                equipe.data.Users.includes(userId));
        });
    }    
}