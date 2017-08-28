import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { UserService } from './user.service'
import { SapService } from './sap.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'
import * as utilsKrino from './../Utils/krino'
import * as utilsDate from './../Utils/dates'


Injectable()
export class OtpService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(UserService) private userService: UserService,
        @Inject(SapService) private sapService: SapService) { }

    // otps
    // ======

    getSelectableOtps(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('otps').map(otps => {
            return otps.map(otp =>
                new SelectableData(otp._id, otp.name)
            )
        });
    }

    private getOtpMoneySpentMapObservable(): Observable<Map<string, number>> {    // parse the orders in a linear way to create a map otp => money spent    (more performance friendly)
        return Observable.combineLatest(this.dataStore.getDataObservable('orders'), this.sapService.getKrinoIdMapObservable(),
            (orders, krinoSapMap) => {
                return orders.filter(order => !krinoSapMap.has(order.kid) && order.status.value !== 'deleted').reduce((map, order) => {
                    if (order.items) {
                        order.items.filter(item => item.otpId && item.total).forEach(item => {
                            let otpId = item.otpId
                            if (!map.has(otpId)) map.set(otpId, 0)
                            map.set(otpId, map.get(otpId) + item.total)
                        })
                    }
                    return map
                }, new Map())
            })
    }

    private migrationChangeOtp(otp) {
        if (!otp.budgetPeriods) {    // for migration of old otps
            otp.budgetPeriods = [
                {
                    budget: otp.budget || 0,
                    datStart: otp.datStart || moment().format('DD/MM/YYYY HH:mm:ss'),
                    datEnd: otp.datEnd || moment().format('DD/MM/YYYY HH:mm:ss')
                }
            ]
            delete otp.budget
            delete otp.datStart
            delete otp.datEnd
        }
        return otp
    }

    private getAnnotationsOfBudgetPeriod(p) {
        var changesSum = !p.budgetHistory ? 0 : p.budgetHistory.reduce((acc, item) => acc + item.budgetIncrement, 0)
        var blockedSum = !p.blockedAmounts ? 0 : p.blockedAmounts.reduce((acc, item) => acc + item.amount, 0)
        return {
            changesSum: changesSum,
            blockedSum: blockedSum,
            budgetAvailable: p.budget + changesSum - blockedSum,
            datStart: p.datStart,
            datEnd: p.datEnd
        }
    }

/*    private createAnnotatedOtp(otp, equipes, dashlets: any[]) {
        if (!otp) return null;
        if (!otp.priority) otp.priority = 0
        otp.priority = +otp.priority || 0
        let equipe = equipes.filter(equipe => equipe._id === otp.equipeId)[0];
        let dashlet = dashlets.filter(dashlet => dashlet.id === otp._id);

        otp = this.migrationChangeOtp(otp)
        var posOfCurrentPeriod= !otp.budgetPeriods ? -1 : otp.budgetPeriods.findIndex(period => utilsDate.isDateIntervalCompatibleWithNow(period.datStart, period.datEnd))

        return {
            data: otp,
            annotation: {
                budgetPeriods: !otp.budgetPeriods ? [] : otp.budgetPeriods.map(p => this.getAnnotationsOfBudgetPeriod(p)),
                currentPeriodIndex: posOfCurrentPeriod,
                currentPeriodAnnotation: posOfCurrentPeriod === -1 ? undefined : this.getAnnotationsOfBudgetPeriod(otp.budgetPeriods[posOfCurrentPeriod]),
                budget: utilsKrino.getOtpBudget(otp),
                equipe: equipe ? equipe.name : 'no equipe',
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        }
    }
*/

    private createAnnotatedOtpForBudget(otp, otpSpentMap, sapIdMap, sapOtpMap: Map<string, any>, equipes, dashlets: any[]) {
        if (!otp) return null;
        if (!otp.priority) otp.priority = 0
        otp.priority = +otp.priority || 0
        otp = this.migrationChangeOtp(otp)

        if (otp.name==='O.VTPAGFM01-01-F'){
            var x=555
        }

        var posOfCurrentPeriod= !otp.budgetPeriods ? -1 : otp.budgetPeriods.findIndex(period => utilsDate.isDateIntervalCompatibleWithNow(period.datStart, period.datEnd))
        var currentPeriodAnnotation= posOfCurrentPeriod === -1 ? undefined : this.getAnnotationsOfBudgetPeriod(otp.budgetPeriods[posOfCurrentPeriod])

        let equipe = equipes.filter(equipe => equipe._id === otp.equipeId)[0];
        let dashlet = dashlets.filter(dashlet => dashlet.id === otp._id);

        let budget = !currentPeriodAnnotation ? 0 : currentPeriodAnnotation.budgetAvailable

        let amountSpentNotYetInSap = otpSpentMap.has(otp._id) ? otpSpentMap.get(otp._id) : 0
        let sapIds = sapOtpMap.has(otp.name) ? Array.from(sapOtpMap.get(otp.name).sapIdSet).map(id => +id) : []
        let sapItems = this.sapService.getSapItemsBySapIdList(sapIdMap, sapIds)
        let amountEngaged = this.sapService.getAmountEngagedByOtpInSapItems(otp.name, sapItems)
        let amountBilled = !currentPeriodAnnotation ? 0 : this.sapService.getAmountInvoicedByOtpInSapItems(otp.name, currentPeriodAnnotation.datStart, sapItems)


        return {
            data: otp,
            annotation: {
                budget: budget,
                budgetPeriods: !otp.budgetPeriods ? [] : otp.budgetPeriods.map(p => this.getAnnotationsOfBudgetPeriod(p)),
                currentPeriodIndex: posOfCurrentPeriod,
                currentPeriodAnnotation: currentPeriodAnnotation,
                amountSpentNotYetInSap: amountSpentNotYetInSap,
                amountEngaged: amountEngaged,
                amountBilled: amountBilled,
                amountSpent: amountSpentNotYetInSap + amountEngaged + amountBilled,
                amountAvailable: !currentPeriodAnnotation ? 0 : (budget - amountSpentNotYetInSap - amountEngaged - amountBilled),
                equipe: equipe ? equipe.name : 'no equipe',
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined                
            }
        }
    }

    getAnnotatedOtps(): Observable<any> {
/*        return Observable.combineLatest(
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('equipes'),
            this.userService.getOtpDashletsForCurrentUser(),
            (otps, equipes, dashlets) => {
                return otps.map(otp => this.createAnnotatedOtp(otp, equipes, dashlets)).sort((a, b) => a.data.name < b.data.name ? -1 : 1)
            });

*/    
        return this.getAnnotatedOtpsMap().map(map => Array.from(map.values()))
    }


    private annotatedOtpsForBudgetMapObservable: ConnectableObservable<any>;


    getAnnotatedOtpsMap(): Observable<any> {

        if (this.annotatedOtpsForBudgetMapObservable) return this.annotatedOtpsForBudgetMapObservable

        this.annotatedOtpsForBudgetMapObservable = Observable.combineLatest(
            this.dataStore.getDataObservable('otps'),
            this.getOtpMoneySpentMapObservable(),
            this.sapService.getSapIdMapObservable(),
            this.sapService.getSapOtpMapObservable(),
            this.dataStore.getDataObservable('equipes'),
            this.userService.getOtpDashletsForCurrentUser(),
            (otps, otpSpentMap, sapIdMap, sapOtpMap, equipes, dashlets) => {
                var a = otps.map(otp => this.createAnnotatedOtpForBudget(otp, otpSpentMap, sapIdMap, sapOtpMap, equipes, dashlets))
                var b = a.sort((a, b) => a.data.name < b.data.name ? -1 : 1)
                return utils.hashMapFactoryForAnnotated(b)
            }).publishReplay(1);

        this.annotatedOtpsForBudgetMapObservable.connect();

        return this.annotatedOtpsForBudgetMapObservable
    }

    getAnnotatedOtpsByEquipe(equipeId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => otps.filter(otp => otp.data.equipeId === equipeId));
    }

    getAnnotatedOpenOtpsByCategory(categoryId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => otps.filter(otp => !otp.data.isBlocked && !otp.data.isClosed && otp.data.categoryIds && otp.data.categoryIds.includes(categoryId)));
    }


    getAnnotatedOtpById(otpId): Observable<any> {
        return this.getAnnotatedOtps().map(otps => {
            let otpFiltered = otps.filter(otp => otp.data._id === otpId);
            return otpFiltered.length === 0 ? null : otpFiltered[0];
        });
    }
}