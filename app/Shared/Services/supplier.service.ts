import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable } from 'rxjs/Rx'


Injectable()
export class SupplierService {
    constructor(@Inject(DataStore) private dataStore: DataStore)  {}

    getSupplier(supplierId): Observable<any> {
        return this.dataStore.getDataObservable('Suppliers').map(suppliers =>
        {
            var x= suppliers.filter(supplier => supplier._id === supplierId);
            return x && x.length > 0 ? x[0] : null;
        } )        
    }

}