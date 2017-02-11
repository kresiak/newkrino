import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ProductService } from './product.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription } from 'rxjs/Rx'


Injectable()
export class PrestationService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService, @Inject(ProductService) private productService: ProductService) {

    }

    private createAnnotatedManip(manip, labels: any[], productsAnnotated: any[]) {
        if (!manip) return null;
        let label = labels.filter(label => label._id === manip.labelId)[0];
        return {
            data: manip,
            annotation: {
                label: label ? label.name : 'unknown label',
                products: productsAnnotated.filter(product => product.data.manipIds.includes(manip._id))
            }
        };
    }

    getAnnotatedManips(manipsObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable("labels"), manipsObservable,
            this.productService.getAnnotatedProductsWithBasketInfo(this.dataStore.getDataObservable('products').map(products => products.filter(product => product.manipIds))),
            (labels, manips, products) => {
                return manips.map(manip => this.createAnnotatedManip(manip, labels, products));
            });
    }

    getAnnotatedManipsAll(): Observable<any> {
        return this.getAnnotatedManips(this.dataStore.getDataObservable("manips"));
    }

    getAnnotatedManipsByLabel(labelId: string): Observable<any> {
        return this.getAnnotatedManips(this.dataStore.getDataObservable("manips").map(manips => manips.filter(manip => manip.labelId === labelId)));
    }




    private createAnnotatedPrestation(prestation, labels: any[], annotatedManips: any[], usersAnnotated: any[], nbAvailableInStockByProduct: any[]) {
        if (!prestation) return null;
        let label = labels.filter(label => label._id === prestation.labelId)[0];
        return {
            data: prestation,
            annotation: {
                label: label ? label.name : 'unknown label',
                manips: !prestation.manips || prestation.manips.length === 0 ? null : prestation.manips.map(manip => {
                    let manipAnnotated= annotatedManips.filter(annotatedManip => annotatedManip.data._id===manip.manipId)[0];
                    return {
                        data: manip,
                        annotation: {
                            manipName: manipAnnotated ? manipAnnotated.data.name : 'unknown manip',
                            worklogs: !manip.worklogs ? null : manip.worklogs.map(log => {
                                let logUserAnnotated= usersAnnotated.filter(user => user.data._id===log.userId)[0];
                                return {
                                    data: log,
                                    annotation: {
                                        userFullName: logUserAnnotated ? logUserAnnotated.annotation.fullName : 'unknown user'
                                    }};
                            }),
                            products: !manip.products ? null : manip.products.map(product => {
                                let productAnnotated= manipAnnotated && manipAnnotated.annotation.products ?
                                     manipAnnotated.annotation.products.filter(prodAnnot => prodAnnot.data._id ===product.productId)[0] : null;  
                                let nbAvailableInStockRecord= nbAvailableInStockByProduct.filter(stockProd => stockProd.productId===product.productId)[0];
                                return {
                                    data: product,
                                    annotation: {
                                        productName: productAnnotated ? productAnnotated.data.name : 'unknowProduit',
                                        nbAvailableInStock: nbAvailableInStockRecord ? nbAvailableInStockRecord : 0
                                    }
                                };
                            })
                        }};
                }) 
            }
        };
    }

    getAnnotatedPrestations(): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable("labels"), this.dataStore.getDataObservable("prestations"), this.getAnnotatedManipsAll(),
                this.authService.getAnnotatedUsers(), this.productService.getNbAvailableInStockByProduct(),
            (labels, prestations, manipsAnnotated, usersAnnotated, nbAvailableInStockByProduct,) => {
                return prestations.sort((cat1, cat2) => { return cat1.reference < cat2.reference ? -1 : 1; })
                            .map(prestation => this.createAnnotatedPrestation(prestation, labels, manipsAnnotated, usersAnnotated, nbAvailableInStockByProduct));
            });
    }


    updatePrestation(prestation): void {
        this.dataStore.updateData('prestations', prestation._id, prestation);
    }

}
