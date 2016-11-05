import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ProductService } from './product.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class PrestationService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService, @Inject(ProductService) private productService: ProductService) {

    }

    private createAnnotedManip(manip, labels: any[], productsAnnotated: any[]) 
    {
        if (!manip) return null;
        let label= labels.filter(label => label._id===manip.labelId)[0];
        return {
            data: manip,
            annotation: {
                label: label ? label.name : 'unknown label',
                products: productsAnnotated.filter(product => product.data.manipIds.includes(manip._id))
            }
        };
    }

    getAnnotatedManips(): Observable<any> {
        return Observable.combineLatest(this.dataStore.getDataObservable("labels"), this.dataStore.getDataObservable("manips"),
            this.productService.getAnnotatedProductsWithBasketInfo(this.dataStore.getDataObservable('Produits').map(products => products.filter(product => product.manipIds))),
            (labels, manips, products) => {
                return manips.map(manip => this.createAnnotedManip(manip, labels, products));
            });
    }


}
