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

    getSapIdMapObservable(): Observable<Map<number, any>> {
        return this.sapIdMapObservable
    }

    getSapItemsObservable(): Observable<any> {
        return this.sapItemsObservable
    }

    getSapOtpMapObservable(): Observable<Map<string, any>> {
        return this.sapOtpMapObservable
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
                var d1 = moment(v1.dateLastActivity, 'DD/MM/YYYY').toDate()
                var d2 = moment(v2.dateLastActivity, 'DD/MM/YYYY').toDate()
                return d1 > d2 ? -1 : 1
            })
        })
    }

    getSapItemsObservableByOtpAndDate(otp: string, dateMin: string) : Observable<any[]> {
        return this.sapOtpMapObservable.switchMap(otpMap => {
            var sapIdList = otpMap.has(otp) ? Array.from(otpMap.get(otp).sapIdSet) : []
            return this.getSapItemsObservableBySapIdList(sapIdList as number[]).map(sapItems => sapItems.filter(mapItem => {
                var d1 = moment(mapItem.dateLastActivity, 'DD/MM/YYYY').toDate() //probably completely wrong to use date here
                var d2 = moment(dateMin, 'DD/MM/YYYY').toDate()                
                return d1 >= d2
            }))
        })
    }


    // Initialisation of the shared multiplexed Observables:  P1 >> (P2 or P3)
    // - P1 initSapIdMapObservable: a Map SapId => {        
    //              - engaged:
    //                  data: as in database
    //                  annotation:        
    //                      totalHtva: total spent on engagement (summing postes)
    //                      totalTvac: ...
    //                      otpMap: Map   OTP name => {       
    //                                      totalHtva: total spent on engagement on that OTP (summing postes)
    //                                      totalTvac: ...
    //                                  }
    //              - factured:
    //                      idem as engaged
    //              - mainData: points either to factured (if present) or to engaged (if not)
    //              - date: createDate (if engaged only), otherwise dateComptable
    //              - postList: array of {poste: number, engaged: poste item if any, factured: poste item if any }
    //              - missingEngagementPoste: (only for items which have both engage and facture) set to true, if we have a billed poste without engagement counterpart
    //              - missingFacturedPoste: (only for items which have both engage and facture) set to true, if we have a engaged poste without billed counterpart
    //              - hasOtpDifference: (only for items which have both engage and facture) set to true if there is a poste with an otp divergence between engage and facture
    //          }
    //  - P2 initSapOtpMapObservable: piped on initSapIdMapObservable: a Map => OTP name => {      
    //                                                          spent: total spent on that OTP
    //                                                          sapIdSet: Set of all SAP  ids that have at least one poste on that OTP
    //                                                      }
    //  - P3 initSapItemsObservable: piped on initSapIdMapObservable: an array of all SapId Items sorted by date

    private sapIdMapObservable: ConnectableObservable<Map<number, any>> = null
    private sapOtpMapObservable: ConnectableObservable<Map<string, any>> = null
    private sapItemsObservable: ConnectableObservable<any> = null


    // Helper for P1
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

    // Helper for P1
    private setPosteInfoArray(sapItemObj) {
        var engaged= sapItemObj.engaged
        var factured= sapItemObj.factured

        var getDistinctOtps= function(poste) {
            return (engaged ? engaged.data.items.filter(item => item.poste === poste).map(item => item.otp) : []).concat(factured ? factured.data.items.filter(item => item.poste === poste).map(item => item.otp) : [])
                            .filter((elem, pos, arr) => arr.indexOf(elem) == pos)   // distinct
                            .sort()
        }

        var getDistinctPostes= function() {
            return (engaged ? engaged.data.items.map(item => item.poste) : []).concat(factured ? factured.data.items.map(item => item.poste) : [])
                            .filter((elem, pos, arr) => arr.indexOf(elem) == pos)   // distinct
                            .sort((a,b) => a-b)
        }
        var postList= getDistinctPostes()

        sapItemObj.postList= postList.map(poste => {
            let amountEngaged= (engaged ? engaged.data.items.filter(item => item.poste == poste && !item.isSuppr) : []).map(item => item.tvac).reduce((a,b) => a+b, 0)
            let amountFactured= (factured ? factured.data.items.filter(item => item.poste == poste && !item.isSuppr) : []).map(item => item.tvac).reduce((a,b) => a+b, 0)

            let lastInvoiceDate= !factured ? '' : factured.data.items.filter(i => !i.isSuppr).map(i => i.dateCreation).sort((a, b) => {
                var d1 = moment(a, 'DD/MM/YYYY').toDate()
                var d2 = moment(b, 'DD/MM/YYYY').toDate()
                return d1 > d2 ? -1 : 1                
            })[0]

            let otpsForPoste= getDistinctOtps(poste)
            if (otpsForPoste.length != 1) sapItemObj.hasOtpError= true
            return {
                poste: poste,
                otp: otpsForPoste[0],
                amountEngaged: amountEngaged,
                amountFactured: amountFactured,
                amountResiduel: amountEngaged > amountFactured ? amountEngaged - amountFactured : 0,
                lastInvoiceDate: lastInvoiceDate
            }
        })
    }

    // P1
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
                obj2.dateLastActivity = obj2.factured ? obj2.factured.data.maxDate : obj2.engaged.data.maxDate
                obj2.hasFactureFinale = (obj2.factured && obj2.factured.data.items.filter(i => i.isFactFinale).length > 0) || (obj2.engaged && obj2.engaged.data.items.filter(i => i.isFactFinale).length > 0)
                obj2.isSuppr = !((obj2.factured && obj2.factured.data.items.filter(i => !i.isSuppr).length > 0) || (obj2.engaged && obj2.engaged.data.items.filter(i => !i.isSuppr).length > 0))
                this.setPosteInfoArray(obj)
                obj2.residuEngaged= obj2.hasFactureFinale ? 0 : obj2.postList.map(p => p.amountResiduel).reduce((a,b) => a+b, 0)
                obj2.alreadyBilled= obj2.postList.map(p => p.amountFactured).reduce((a,b) => a+b, 0)
            })

            console.log('In getSapIdMapObservable: ' + map2.size)

            return map2
        }).publishReplay(1)
        this.sapIdMapObservable.connect()
    }

    // P2
    private initSapOtpMapObservable(): void {
        this.sapOtpMapObservable = this.getSapIdMapObservable().map(idMap => {
            let otpMap = new Map<string, any>()            

            Array.from(idMap.values()).forEach(value => {                
                let sapId= value.mainData.data.sapId;

                var doWork= function(sapObj) {
                    if (!sapObj || !sapObj.data || !sapObj.data.items) return
                    sapObj.data.items.forEach(item => {
                       let key = item.otp 
                       if (!otpMap.has(key)) otpMap.set(key, {spent: 0, sapIdSet: new Set<number>()})
                       let obj= otpMap.get(key)
                       if (!obj.sapIdSet.has(sapId)) obj.sapIdSet.add(sapId)                        
                    })
                }

                doWork(value.engaged)
                doWork(value.factured)
            })
            console.log('In initSapOtpMapObservable: ' + otpMap.size)
            return otpMap
        }).publishReplay(1)
        this.sapOtpMapObservable.connect()
    }


    // P3
    initSapItemsObservable() {
        this.sapItemsObservable= this.sapIdMapObservable.map(sapIdMap => {
            console.log('In initSapItemsObservable')
            return Array.from(sapIdMap.values()).sort((v1, v2) => {
                var d1 = moment(v1.dateLastActivity, 'DD/MM/YYYY').toDate()
                var d2 = moment(v2.dateLastActivity, 'DD/MM/YYYY').toDate()
                return d1 > d2 ? -1 : 1
            })
        }).publishReplay(1)
        this.sapItemsObservable.connect()
    }


}

