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
       this.initSapOtpMapObservable()
    }

    private sapIdMapObservable: ConnectableObservable<Map<number, any>> = null
    private sapOtpMapObservable: ConnectableObservable<Map<string, number>> = null

    getSapIdMapObservable() : Observable<Map<number, any>> {
        return this.sapIdMapObservable
    }

    getSapItemsObservable() : Observable<any> {
        return this.sapIdMapObservable.map(sapIdMap => {
            return Array.from(sapIdMap.values()).sort((a,b) => b.mainData.data.sapId - a.mainData.data.sapId)
        })
    }
    

    getSapOtpMapObservable() : Observable<Map<string, number>> {
        return this.sapOtpMapObservable
    }

    private createSapObject(sapObj) {
        var totalObj= sapObj.items.filter(item => !item.isSuppr && !item.isBlocked).reduce((acc, item) => {
            acc.totalHtva += item.htva
            acc.totalTvac += item.tvac
            if (!acc.otpMap.has(item.otp)) acc.otpMap.set(item.otp, {totalHtva: 0, totalTvac: 0})
            var oo= acc.otpMap.get(item.otp)
            oo.totalHtva += item.htva
            oo.totalTvac += item.tvac            
            return acc
        }, {
            totalHtva: 0,
            totalTvac: 0,
            otpMap: new Map<string, any>()
        })
        return {
            data: sapObj,
            annotation: {
                totalHtva: totalObj.totalHtva,
                totalTvac: totalObj.totalTvac,
                otpMap: totalObj.otpMap
            }
        }
    }

    private initSapIdMapObservable() : void {
        this.sapIdMapObservable= Observable.combineLatest(this.dataStore.getDataObservable('sap.engage'), this.dataStore.getDataObservable('sap.facture'), (engages, factures) => {

            let map= engages.reduce((acc: Map<number, any>, e) => {
                acc.set(e.sapId, {engaged: this.createSapObject(e)})
                return acc
            }, new Map<number, any>())

            let map2= factures.reduce((acc: Map<number, any>, f) => {
                if (!acc.has(f.sapId)) {
                    acc.set(f.sapId, {})
                }
                acc.get(f.sapId).factured= this.createSapObject(f)

                return acc
            }, map)

            Array.from(map2.values()).forEach(obj => {
                let obj2= obj as any
                obj2.mainData= obj2.factured ? obj2.factured : obj2.engaged
                obj2.date= obj2.factured ? obj2.factured.data.dateComptable : obj2.engaged.data.dateCreation
            })

            console.log('In getSapIdMapObservable: ' + map2.size)

            return map2
        }).publishReplay(1)
        this.sapIdMapObservable.connect()
    }

    private initSapOtpMapObservable() : void {
        this.sapOtpMapObservable= this.getSapIdMapObservable().map(idMap => {
            let otpMap= new Map<string, number>()

            Array.from(idMap.values()).forEach(value => {
                (value.mainData.data.items || []).filter(item => !item.isSuppr && !item.isBlocked).forEach(item => {
                    let otp= item.otp
                    if (!otpMap.has(otp)) otpMap.set(otp, 0)
                    otpMap.set(otp, otpMap.get(otp) + item.tvac)
                })
            })
            console.log('In initSapOtpMapObservable: ' + otpMap.size)
            return otpMap
        }).publishReplay(1)
        this.sapOtpMapObservable.connect()
    }

}

