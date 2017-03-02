import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ApiService } from './api.service'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"


Injectable()
export class SapService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) {
        this.initSapIdMapObservable()
        this.initSapOtpMapObservable()
        this.initSapItemsObservable()
    }

    private sapIdMapObservable: ConnectableObservable<Map<number, any>> = null
    private sapOtpMapObservable: ConnectableObservable<Map<string, any>> = null
    private sapItemsObservable: ConnectableObservable<any> = null

    getSapIdMapObservable(): Observable<Map<number, any>> {
        return this.sapIdMapObservable
    }



    getSapItemObservable(sapId: number): Observable<any> {
        return this.getSapIdMapObservable().map(idMap => idMap.has(sapId) ? idMap.get(sapId) : {})
    }

    getSapItemsObservableBySapIdList(sapIdList: number[]): Observable<any[]> {
        return this.sapIdMapObservable.map(sapIdMap => {
            var sapItemsToReturn= []
            sapIdList.forEach(id => {
                if (sapIdMap.has(id)) 
                    sapItemsToReturn.push(sapIdMap.get(id))
            })
            return sapItemsToReturn.sort((v1, v2) => {
                var d1 = moment(v1.date, 'DD/MM/YYYY').toDate()
                var d2 = moment(v2.date, 'DD/MM/YYYY').toDate()
                return d1 > d2 ? -1 : 1
            })
        })
    }

    getSapItemsObservableByOtpAndDate(otp: string, dateMin: string) : Observable<any[]> {
        return this.sapOtpMapObservable.switchMap(otpMap => {
            var sapIdList = otpMap.has(otp) ? Array.from(otpMap.get(otp).sapIdSet) : []
            return this.getSapItemsObservableBySapIdList(sapIdList as number[]).map(sapItems => sapItems.filter(mapItem => {
                var d1 = moment(mapItem.date, 'DD/MM/YYYY').toDate()
                var d2 = moment(dateMin, 'DD/MM/YYYY').toDate()                
                return d1 >= d2
            }))
        })
    }

    getSapItemsObservable(): Observable<any> {
        return this.sapItemsObservable
    }

    initSapItemsObservable() {
        this.sapItemsObservable= this.sapIdMapObservable.map(sapIdMap => {
            console.log('In initSapItemsObservable')
            return Array.from(sapIdMap.values()).sort((v1, v2) => {
                var d1 = moment(v1.date, 'DD/MM/YYYY').toDate()
                var d2 = moment(v2.date, 'DD/MM/YYYY').toDate()
                return d1 > d2 ? -1 : 1
            })
        }).publishReplay(1)
        this.sapItemsObservable.connect()
    }


    getSapOtpMapObservable(): Observable<Map<string, any>> {
        return this.sapOtpMapObservable
    }

    private createSapObject(sapObj) {
        var totalObj = sapObj.items.filter(item => !item.isSuppr && !item.isBlocked).reduce((acc, item) => {
            acc.totalHtva += item.htva
            acc.totalTvac += item.tvac
            if (!acc.otpMap.has(item.otp)) acc.otpMap.set(item.otp, { totalHtva: 0, totalTvac: 0 })
            var oo = acc.otpMap.get(item.otp)
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
                otpMap: totalObj.otpMap,
                otpTxt: totalObj.otpMap.size === 0 ? 'no OTP' : Array.from(totalObj.otpMap.keys()).reduce((a, b) => a + ', ' + b)
            }
        }
    }

    private initSapIdMapObservable(): void {
        this.sapIdMapObservable = Observable.combineLatest(this.dataStore.getDataObservable('sap.engage'), this.dataStore.getDataObservable('sap.facture'), (engages, factures) => {

            let map = engages.reduce((acc: Map<number, any>, e) => {
                acc.set(e.sapId, { engaged: this.createSapObject(e) })
                return acc
            }, new Map<number, any>())

            let map2 = factures.reduce((acc: Map<number, any>, f) => {
                if (!acc.has(f.sapId)) {
                    acc.set(f.sapId, {})
                }
                acc.get(f.sapId).factured = this.createSapObject(f)

                return acc
            }, map)

            Array.from(map2.values()).forEach(obj => {
                let obj2 = obj as any
                obj2.mainData = obj2.factured ? obj2.factured : obj2.engaged
                obj2.date = obj2.factured ? obj2.factured.data.dateComptable : obj2.engaged.data.dateCreation
            })

            console.log('In getSapIdMapObservable: ' + map2.size)

            return map2
        }).publishReplay(1)
        this.sapIdMapObservable.connect()
    }

    private initSapOtpMapObservable(): void {
        this.sapOtpMapObservable = this.getSapIdMapObservable().map(idMap => {
            let otpMap = new Map<string, any>()

            Array.from(idMap.values()).forEach(value => {
                let sapId= value.mainData.data.sapId;
                (value.mainData.data.items || []).filter(item => !item.isSuppr && !item.isBlocked).forEach(item => {
                    let key = item.otp
                    if (!otpMap.has(key)) otpMap.set(key, {spent: 0, sapIdSet: new Set<number>()})
                    let obj= otpMap.get(key)
                    obj.spent += +item.tvac
                    if (!obj.sapIdSet.has(sapId)) obj.sapIdSet.add(sapId)
                })
            })
            console.log('In initSapOtpMapObservable: ' + otpMap.size)
            return otpMap
        }).publishReplay(1)
        this.sapOtpMapObservable.connect()
    }



}

