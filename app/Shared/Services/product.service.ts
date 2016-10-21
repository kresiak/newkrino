import {Injectable, Inject} from '@angular/core'
import { DataStore } from './data.service'
import {AuthService} from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class ProductService
{
    constructor(@Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) {}

    getSelectableCategories() : Observable<SelectableData[]>
    {
        return this.dataStore.getDataObservable('Categories').map(categories => {
            return categories.map(category =>
                new SelectableData(category._id, category.Description)
            )
        });
    }

    updateProduct(product): void{
       this.dataStore.updateData('Produits', product._id, product);
    }

    createCategory(newCategory): void {
       this.dataStore.addData('Categories', {'Description': newCategory});
    }

    getProductsBySupplier(supplier): Observable<any>
    {
        return this.dataStore.getDataObservable('Produits').map(produits => produits.filter(produit => produit.Supplier===supplier._id));
    }

    getBasketItemForCurrentUser(product) : Observable<any>
    {
        return this.dataStore.getDataObservable('basket').map(basket =>
        {                                    
            var basketItems= basket.filter(basketItem => 
            basketItem.produit === product._id && basketItem.user === this.authService.getUserId()
            );
            return basketItems && basketItems.length > 0 ? basketItems[0] : null;  
        });         
    }

    getBasketItemsForCurrentUser() : Observable<any>
    {
        return this.dataStore.getDataObservable('basket').map(basket =>
        {                                    
            return basket.filter(basketItem => 
                basketItem.user === this.authService.getUserId()
                    );
        });         
    }

    getProductsInBasketBySupplier(supplier) : Observable<any>
    {
        return Observable.combineLatest(this.getProductsBySupplier(supplier), this.getBasketItemsForCurrentUser(),
            (products, basketItems) => 
            {
                return products.filter(product => basketItems.map(item => item.produit).includes(product._id));
            }
        );
    }

    createBasketItem(product, quantity: number)
    {
        this.dataStore.addData('basket', {user: this.authService.getUserId(), produit: product._id, quantity: quantity});
    }

    updateBasketItem(basketItem)
    {
        this.dataStore.updateData('basket', basketItem._id, basketItem);
    }    

    removeBasketItem(basketItem)
    {
        this.dataStore.deleteData('basket', basketItem._id);
    }
}
