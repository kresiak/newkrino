import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class OrderService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) { }

    getSelectableOtps(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('otps').map(otps => {
            return otps.map(otp =>
                new SelectableData(otp._id, otp.Name)
            )
        });
    }

    updateOrder(order): void {
        this.dataStore.updateData('orders', order._id, order);
    }

    private getTotalOfOrder(order): number {
        return order.items && order.items.length > 0 ? order.items.map(item => item.total).reduce((a, b) => a + b) : 0;
    }


    private createAnnotedOrder(order, products, otps, users, equipes, suppliers) {
        if (!order) return null;
        let supplier = suppliers.filter(supplier => supplier._id === order.supplierId)[0];
        let equipe = equipes.filter(equipe => equipe._id === order.equipeId)[0];
        let user = users.filter(user => user._id === order.userId)[0];
        return {
            data: order,
            annotation: {
                user: user ? user.firstName + ' ' + user.name : 'Unknown user',
                supplier: supplier ? supplier.Nom : 'Unknown supllier',
                equipe: equipe ? equipe.Name : 'Unknown equipe',
                total: this.getTotalOfOrder(order),
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

    getAnnotedOrder(id: string): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('orders').map(orders => orders.filter(order => order._id === id)[0]),
            this.dataStore.getDataObservable('Produits'),
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('krinousers'),
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('Suppliers'),
            (order, products, otps, users, equipes, suppliers) => {
                return this.createAnnotedOrder(order, products, otps, users, equipes, suppliers);
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
            (orders, products, otps, users, equipes, suppliers) => {
                return orders.map(order =>
                    this.createAnnotedOrder(order, products, otps, users, equipes, suppliers)
                );
            })
    }

    getAnnotedOrdersBySupplier(supplierId: string): Observable<any> {
        return this.getAnnotedOrders().map(orders => orders.filter(order => order.data.supplierId === supplierId));
    }

    getAnnotedOrdersByEquipe(equipeId: string): Observable<any> {
        return this.getAnnotedOrders().map(orders => orders.filter(order => order.data.equipeId === equipeId));
    }

    private createAnnotatedEquipe(equipe, orders: any[], otps: any[]) {
        if (!equipe) return null;

        let ordersFiltered = orders.filter(order => order.equipeId === equipe._id);
        let amountSpent = ordersFiltered.length === 0 ? 0 : ordersFiltered.map(order => this.getTotalOfOrder(order)).reduce((a, b) => a + b);

        return {
            data: equipe,
            annotation:
            {
                amountSpent: amountSpent
            }
        };
    }

    getAnnotatedEquipes(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('equipes'),
            this.dataStore.getDataObservable('orders'),
            this.dataStore.getDataObservable('otps'),
            (equipes, orders, otps) => {
                return equipes.map(equipe => this.createAnnotatedEquipe(equipe, orders, otps))
            });
    }
}