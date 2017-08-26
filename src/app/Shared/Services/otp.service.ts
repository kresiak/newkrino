import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { UserService } from './user.service'
import { SapService } from './sap.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'
import * as utilsKrino from './../Utils/krino'


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

    private createAnnotatedOtp(otp, equipes, dashlets: any[]) {
        if (!otp) return null;
        if (!otp.priority) otp.priority = 0
        otp.priority = +otp.priority || 0
        let equipe = equipes.filter(equipe => equipe._id === otp.equipeId)[0];
        let dashlet = dashlets.filter(dashlet => dashlet.id === otp._id);
        if (!otp.datStart) otp.datStart = moment().format('DD/MM/YYYY HH:mm:ss')
        if (!otp.datEnd) otp.datEnd = moment().format('DD/MM/YYYY HH:mm:ss')

        otp= this.migrationChangeOtp(otp)

        return {
            data: otp,
            annotation: {
                budget: utilsKrino.getOtpBudget(otp),
                equipe: equipe ? equipe.name : 'no equipe',
                dashletId: dashlet.length > 0 ? dashlet[0]._id : undefined
            }
        }
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

    private createAnnotatedOtpForBudget(otp, otpSpentMap, sapIdMap, sapOtpMap: Map<string, any>) {
        if (!otp) return null;
        if (!otp.priority) otp.priority = 0
        otp.priority = +otp.priority || 0
        let amountSpentNotYetInSap = otpSpentMap.has(otp._id) ? otpSpentMap.get(otp._id) : 0
        let sapIds = sapOtpMap.has(otp.name) ? Array.from(sapOtpMap.get(otp.name).sapIdSet).map(id => +id) : []
        let sapItems = this.sapService.getSapItemsBySapIdList(sapIdMap, sapIds)
        let amountEngaged = this.sapService.getAmountEngagedByOtpInSapItems(otp.name, sapItems)
        let amountBilled = this.sapService.getAmountInvoicedByOtpInSapItems(otp.name, otp.datStart, sapItems)

        otp= this.migrationChangeOtp(otp)

        let budget = utilsKrino.getOtpBudget(otp)

        return {
            data: otp,
            annotation: {
                budget: budget,
                amountSpentNotYetInSap: amountSpentNotYetInSap,
                amountEngaged: amountEngaged,
                amountBilled: amountBilled,
                amountSpent: amountSpentNotYetInSap + amountEngaged + amountBilled,
                amountAvailable: budget - amountSpentNotYetInSap - amountEngaged - amountBilled
            }
        }
    }

    getAnnotatedOtps(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('otps'),
            this.dataStore.getDataObservable('equipes'),
            this.userService.getOtpDashletsForCurrentUser(),
            (otps, equipes, dashlets) => {
                return otps.map(otp => this.createAnnotatedOtp(otp, equipes, dashlets)).sort((a, b) => a.data.name < b.data.name ? -1 : 1)
            });
    }


    private annotatedOtpsForBudgetMapObservable: ConnectableObservable<any>;


    getAnnotatedOtpsForBudgetMap(): Observable<any> {

        if (this.annotatedOtpsForBudgetMapObservable) return this.annotatedOtpsForBudgetMapObservable

        this.annotatedOtpsForBudgetMapObservable = Observable.combineLatest(
            this.dataStore.getDataObservable('otps'),
            this.getOtpMoneySpentMapObservable(),
            this.sapService.getSapIdMapObservable(),
            this.sapService.getSapOtpMapObservable(),
            (otps, otpSpentMap, sapIdMap, sapOtpMap) => {
                var a = otps.map(otp => this.createAnnotatedOtpForBudget(otp, otpSpentMap, sapIdMap, sapOtpMap))
                var b = a.sort((a, b) => a.data.name < b.data.name ? -1 : 1)
                return utils.hashMapFactoryForAnnotated(b)
            }).publishReplay(1);

        this.annotatedOtpsForBudgetMapObservable.connect();

        return this.annotatedOtpsForBudgetMapObservable
    }


    getAnnotatedOtpsForBudget(): Observable<any> {
        return this.getAnnotatedOtpsForBudgetMap().map(map => Array.from(map.values()))
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