import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { ApiService } from './api.service'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utilsObservable from './../Utils/observables'


Injectable()
export class SapService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) {
        this.initSapIdMapObservable()
        this.initSapOtpMapObservable()
        this.initSapItemsObservable()
        this.initKrinoIdMapObservable()
        //this.initTvaSetObservable()
    }

    private isConnected: boolean = false

    private connectAll() {
        if (this.isConnected) return
        this.isConnected = true
        this.sapIdMapObservable.connect()
        this.sapOtpMapObservable.connect()
        this.sapItemsObservable.connect()

    }

    // return values
    // =============

    getSapItemsBySapIdList(sapIdMap: Map<number, any>, sapIdList: number[]) {
        var sapItemsToReturn = []
        sapIdList.forEach(id => {
            if (sapIdMap.has(id))
                sapItemsToReturn.push(sapIdMap.get(id))
        })
        return sapItemsToReturn
    }

    getAmountEngagedByOtpInSapItems(otpName: string, sapItems: any[]) {
        var res=sapItems.reduce((acc, sapItem) => {
                return acc + sapItem.postList.filter(poste => poste.otp === otpName).reduce((acc2, poste) => {
                    return acc2 + poste.amountResiduel
                }, 0)
            }, 0)
        return res
    }

    filterFactureItemsBasedOnOtp(items, otpName: string, otpStartingDate: string) {
        return items.filter(item => item.otp===otpName && !item.isBlocked && !item.isSuppr)
                .filter(item => {
                    var dOtpStart = moment(otpStartingDate, 'DD/MM/YYYY HH:mm:ss').toDate()
                    var dInvoice = moment(item.dateCreation, 'DD/MM/YYYY').toDate()
                    return dInvoice >= dOtpStart
                })
    }

    getAmountInvoicedByOtpInSapItems(otpName: string, otpStartingDate: string, sapItems: any[]) {
        var res=sapItems.reduce((acc, sapItem) => {
                var sumInThis= !sapItem.factured ? 0 : 
                this.filterFactureItemsBasedOnOtp(sapItem.factured.data.items, otpName, otpStartingDate).reduce((acc2, item) => {
                    return acc2 + item.tvac
                }, 0)

                return acc + sumInThis
            }, 0)
        return res
    }

    // return observables
    // ==================

    getSapIdMapObservable(): Observable<Map<number, any>> {
        this.connectAll()
        return this.sapIdMapObservable
    }

    getSapItemsObservable(): Observable<any> {
        this.connectAll()
        return this.sapItemsObservable
    }

    public getSapOtpMapObservable(): Observable<Map<string, any>> {
        this.connectAll()
        return this.sapOtpMapObservable
    }

    getSapItemsByOtpObservable(otpName: string): Observable<any> {
        return this.getSapOtpMapObservable().map(map => !map.has(otpName) ? null : Array.from(map.get(otpName).sapIdSet))
    }

    getKrinoIdMapObservable(): Observable<Map<number, number>> {
        return this.krinoIdMapObservable
    }

    getSapItemObservable(sapId: number): Observable<any> {
        return this.getSapIdMapObservable().map(idMap => idMap.has(sapId) ? idMap.get(sapId) : {})
    }

    getSapItemsObservableBySapIdList(sapIdList: number[]): Observable<any[]> {
        return this.getSapIdMapObservable().map(sapIdMap => {
            return this.getSapItemsBySapIdList(sapIdMap, sapIdList)
        })
    }

    getSapItemsObservableByOtpAndDate(otp: string, dateMin: string): Observable<any[]> {
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
    private krinoIdMapObservable: ConnectableObservable<Map<number, number>> = null



    // P1
    private initSapIdMapObservable(): void {
        this.sapIdMapObservable = this.dataStore.getDataObservable('sap.fusion').map(utilsObservable.hashMapFactoryCurry(elem => elem.sapId)).publishReplay(1)
    }


    // P2
    private initSapOtpMapObservable(): void {
        this.sapOtpMapObservable = this.sapIdMapObservable.map(idMap => {
            console.log('In initSapOtpMapObservable: entering' )
            let otpMap = new Map<string, any>()

            Array.from(idMap.values()).forEach(value => {
                let sapId = value.mainData.data.sapId;

                var doWork = function (sapObj) {
                    if (!sapObj || !sapObj.data || !sapObj.data.items) return
                    sapObj.data.items.forEach(item => {
                        let key = item.otp
                        if (!otpMap.has(key)) otpMap.set(key, { spent: 0, sapIdSet: new Set<number>() })
                        let obj = otpMap.get(key)
                        if (!obj.sapIdSet.has(sapId)) obj.sapIdSet.add(sapId)
                    })
                }

                doWork(value.engaged)
                doWork(value.factured)
            })
            console.log('In initSapOtpMapObservable: ' + otpMap.size)
            return otpMap
        }).publishReplay(1)
    }


    // P3
    initSapItemsObservable() {
        this.sapItemsObservable = this.dataStore.getDataObservable('sap.fusion').map(saps => saps.sort((a,b)=>a.counter-b.counter)).publishReplay(1)   // forst this publishReplay is not really needed...
    }

    // P4
    initKrinoIdMapObservable() {
        this.krinoIdMapObservable = this.dataStore.getDataObservable('sap.engage').map(engs => engs.reduce((acc, eng) => {
            if (eng.ourRef && +eng.ourRef) {
                acc.set(+eng.ourRef, +eng.sapId)
            }
            return acc
        }, new Map<number, number>())).publishReplay(1)
        console.log('In initKrinoIdMapObservable')
        this.krinoIdMapObservable.connect()
    }

    private sapTvaCodesObservable: ConnectableObservable<any> = null

    /*    // P5
        initTvaSetObservable() {
            this.sapTvaCodesObservable = this.dataStore.getDataObservable('sap.engage').map(engs => {
                var list = [1, 2];
                list = [...list, 3, 4];            
                var xx= engs.reduce((acc, eng) => {
                    eng.items.forEach(item => {
                        if (+item.codeTva || item.codeTva === '') {
                            var ddqw=''
                        }
                        acc.add(item.codeTva)
                    })
                    return acc
                }, new Set<string>())
                var yy= Array.from(xx).sort()
                console.log(yy.reduce((a,b) => a + ', ' + b))
                return yy
            }).publishReplay(1)
            console.log('In initTvaSetObservable')
            this.sapTvaCodesObservable.connect()
        }*/


}

