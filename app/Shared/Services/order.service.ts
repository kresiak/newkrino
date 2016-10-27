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
                total: order.items.map(item => item.total).reduce((a, b) => 
                    a + b
                ),
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


}