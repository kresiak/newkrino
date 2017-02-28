import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ApiService } from './api.service'
import { Observable, Subscription, ConnectableObservable  } from 'rxjs/Rx'
import * as moment from "moment"


Injectable()
export class SapService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) { 
       this.initSapIdMapObservable() 
    }

    private sapIdMapObservable: ConnectableObservable<Map<number, any>> = null

    getSapIdMapObservable() : Observable<Map<number, any>> {
        return this.sapIdMapObservable
    }

    private initSapIdMapObservable() : void {
        this.sapIdMapObservable= Observable.combineLatest(this.dataStore.getDataObservable('sap.engage'), this.dataStore.getDataObservable('sap.facture'), (engages, factures) => {

            let map= engages.reduce((acc: Map<number, any>, e) => {
                acc.set(e.sapId, {engaged: e})
                return acc
            }, new Map<number, any>())

            let map2= factures.reduce((acc: Map<number, any>, f) => {
                if (!acc.has(f.sapId)) {
                    acc.set(f.sapId, {})
                }
                acc.get(f.sapId).factured= f

                return acc
            }, map)

            console.log('In getSapIdMapObservable: ' + map2.size)

            return map2
        }).publishReplay(1)
        this.sapIdMapObservable.connect()
    }

}

