import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'
import * as utilsComparator from './../Utils/comparators'
import * as utilsKrino from './../Utils/krino'


Injectable()
export class PlatformService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) { }

    // Service snapshots....
    // =====================

    private getCurrentSnapshotIdOfService(serviceId, snapshots) {
        var theSnapshot = snapshots.filter(s => !s.isDisabled && s.serviceId === serviceId).sort((a, b) => {
            var d1 = moment(a.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
            var d2 = moment(b.createDate, 'DD/MM/YYYY HH:mm:ss').toDate()
            return d1 > d2 ? -1 : 1
        })[0]
        return theSnapshot ? { id: theSnapshot._id, version: theSnapshot.version } : undefined
    }

    private getCostsOfSnapshotMap(snapshotId, snapshotSteps): Map<string, number> {
        var map = new Map()
        snapshotSteps.filter(ss => ss.serviceId === snapshotId && !ss.data.isDisabled).forEach(step => {
            (step.annotation.costsByClientType || []).forEach(costObj => {
                if (!map.has(costObj.clientTypeId)) map.set(costObj.clientTypeId, 0)
                map.set(costObj.clientTypeId, map.get(costObj.clientTypeId) + costObj.grandTotalCost)
            })
        })

        return map
    }

    // Service step annotation....
    // ============================

    private createAnnotatedServiceStep(serviceStep, services: any[], machines, productMap: Map<string, any>, labourTypes, clients, corrections, snapshots, snapshotSteps) {
        var self = this

        var stepServicesInfos = (serviceStep.services || []).map(s => {
            let theService = services.filter(service => s.id === service._id)[0]
            var theSnapshot = this.getCurrentSnapshotIdOfService(s.id, snapshots)
            if (!theSnapshot) return undefined
            var costMap = this.getCostsOfSnapshotMap(theSnapshot.id, snapshotSteps)
            return {
                service: theService.name,
                snapshot: theSnapshot.version,
                quantity: s.quantity,
                costMap: costMap
            }
        }).filter(x => x)

        function getTotals(clientTypeId) {
            let correctionsFactors = self.getCorrectionsOfClientType(clientTypeId, clients, corrections)

            let servicesCosts = stepServicesInfos.map(s => {
                var costUnit = s.costMap.has(clientTypeId) ? +s.costMap.get(clientTypeId) : 0
                return {
                    labeltxt: s.service + ' ' + s.snapshot + ' (' + s.quantity + ' u.)',
                    extraValue: costUnit * s.quantity
                }
            })

            let sumServicesCosts = servicesCosts.reduce((acc, pe) => acc + +pe.extraValue, 0) || 0

            let productsExtras = correctionsFactors.filter(cf => cf.data.isOnProduct).map(cf => {
                return {
                    labeltxt: cf.name + ' (' + cf.perCent + '%)',
                    extraValue: cf.perCent / 100 * productsCost
                }
            })
            let sumProductsExtras = productsExtras.reduce((acc, pe) => acc + +pe.extraValue, 0)

            let labourReductions = correctionsFactors.filter(cf => cf.data.isOnLabour).map(cf => {
                return {
                    labeltxt: cf.name + ' (' + cf.perCent + '%)',
                    extraValue: -(100 - cf.perCent) / 100 * labourCost
                }
            })
            let sumLabourReduction = labourReductions.reduce((acc, pe) => acc + +pe.extraValue, 0)

            // totals
            // ======

            let total = sumServicesCosts + labourCost + sumLabourReduction + productsCost + sumProductsExtras + ((machine && machine.annotation) ? machine.annotation.costOfHour * (serviceStep.runtime || 0) : 0)

            let totalExtras = correctionsFactors.filter(cf => cf.data.isOnTotal).map(cf => {
                return {
                    labeltxt: cf.name + ' (' + cf.perCent + '%)',
                    extraValue: cf.perCent / 100 * total
                }
            })

            let sumOfTotalExtras = totalExtras.reduce((acc, pe) => acc + +pe.extraValue, 0)

            return {
                clientTypeId: clientTypeId,
                clientType: (clients.filter(c => c._id === clientTypeId)[0] || { name: 'standard' }).name,
                productsExtras: productsExtras,
                labourReductions: labourReductions,
                totalCost: total,
                totalExtras: totalExtras,
                grandTotalCost: total + sumOfTotalExtras,
                servicesCosts: servicesCosts
            }
        }

        if (!serviceStep) return null;

        let service = services.filter(service => serviceStep.serviceId === service._id)[0]

        let machine = machines.filter(machine => serviceStep.machineId === machine.data._id)[0] || {}

        // products 
        // ========

        let productsCost = (serviceStep.products || []).reduce((acc, p) => {
            let nbUnitsInProduct = productMap.has(p.id) ? (utilsKrino.getNumberInString(productMap.get(p.id).package) || 1) : 1
            let unitPrice = productMap.has(p.id) ? productMap.get(p.id).price / nbUnitsInProduct : 0
            return acc + unitPrice * p.quantity
        }, 0)


        // labour
        // ======

        let labourCost = (serviceStep.labourTypes || []).reduce((acc, ltInDb) => {
            let labourType = labourTypes.filter(lt => lt._id === ltInDb.id)[0]
            let unitPrice = labourType ? labourType.hourlyRate : 0
            return acc + unitPrice * ltInDb.nbHours
        }, 0)


        var costsByClientType = clients.map(ct => getTotals(ct._id))
        costsByClientType.push(getTotals(undefined))

        return {
            data: serviceStep,
            annotation:
            {
                serviceName: (service || {}).name,
                serviceDescription: (service || {}).description,
                machineName: (machine.data || {}).name,
                machineCost: (machine && machine.annotation) ? machine.annotation.costOfHour * (serviceStep.runtime || 0) : 0,
                productsCost: productsCost,
                labourCost: labourCost,
                costsByClientType: costsByClientType,
                grandTotalCost: getTotals((service || {}).clientTypeId).grandTotalCost,
                grandTotalCostOnStandard: getTotals(undefined).grandTotalCost,
                products: (serviceStep.products || []).map(prod => {
                    let nbUnitsInProduct = productMap.has(prod.id) ? (utilsKrino.getNumberInString(productMap.get(prod.id).package) || 1) : 1
                    let unitPrice = productMap.has(prod.id) ? productMap.get(prod.id).price / nbUnitsInProduct : -1
                    return {
                        data: prod,
                        annotation: {
                            product: productMap.has(prod.id) ? productMap.get(prod.id).name : 'unknown product',
                            package: productMap.has(prod.id) ? productMap.get(prod.id).package : 'unknown package',
                            nbUnitsInProduct: nbUnitsInProduct,
                            productPrice: unitPrice,
                            productTotal: prod.quantity * unitPrice
                        }
                    }
                }),
                labourTypes: labourTypes.sort((a, b) => a.name <= b.name ? -1 : 1).map(lt => {
                    var labourTypeAsInDb = (serviceStep.labourTypes || []).filter(slt => slt.id === lt._id)[0]
                    var nbHours = labourTypeAsInDb ? labourTypeAsInDb.nbHours : 0
                    return {
                        data: lt,
                        annotation: {
                            nbHours: nbHours,
                            totalCost: nbHours * lt.hourlyRate
                        }
                    }
                }),
                services: (serviceStep.services || []).map(s => {
                    let theService = services.filter(service => s.id === service._id)[0]
                    return {
                        data: s,
                        annotation: {
                            service: theService ? theService.name : 'unknown service'
                        }
                    }
                })
            }
        };
    }


    private getAnnotatedServiceSteps(stepObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(
            stepObservable,
            this.dataStore.getDataObservable('platform.services'),
            this.getAnnotatedMachines(),
            this.dataStore.getDataObservable('products').map(utils.hashMapFactory),
            this.dataStore.getDataObservable('platform.labour.types'),
            this.dataStore.getDataObservable('platform.client.types'),
            this.dataStore.getDataObservable('platform.correction.types'),
            this.dataStore.getDataObservable('platform.service.snapshots'),
            this.dataStore.getDataObservable('platform.service.step.snapshots'),
            (serviceSteps, services, machines, productMap, labourTypes, clients, corrections, snapshots, snapshotSteps) => {
                return serviceSteps.map(serviceStep => this.createAnnotatedServiceStep(serviceStep, services, machines, productMap, labourTypes, clients, corrections, snapshots, snapshotSteps))
            });
    }


    getAnnotatedServiceStepsByService(serviceId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step.serviceId === serviceId && !step.isDisabled)))
    }

    getAnnotatedDisabledServiceStepsByService(serviceId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step.serviceId === serviceId && step.isDisabled)))
    }


    // Services annotation....
    // =======================

    getAnnotatedServiceStep(serviceStepId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step._id === serviceStepId))).map(steps => steps[0])
    }

    private getAnnotatedServicesHelper(servicesObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(
            servicesObservable,
            this.dataStore.getDataObservable('platform.client.types'),
            this.dataStore.getDataObservable('platform.correction.types'),
            this.dataStore.getDataObservable('platform.service.categories'),
            (services, clients, corrections, categories) => {
                return services.map(service => {
                    let correctionsFactors = this.getCorrectionsOfClientType(service.clientTypeId, clients, corrections)
                    let clientType = clients.filter(ct => ct._id === service.clientTypeId)[0]
                    let category = categories.filter(ct => (service.categoryIds || []).includes(ct._id)).map(ct => ct.name).sort((a, b) => a > b ? 1 : -1)
                        .reduce((acc, c) => acc ? (acc + ', ' + c) : c, '')
                    return {
                        data: service,
                        annotation: {
                            correctionsFactors: correctionsFactors,
                            clientType: clientType ? clientType.name : 'standard corrections',
                            category: category || 'no category'
                        }
                    }
                })
            });
    }

    getAnnotatedServices(): Observable<any> {
        return this.getAnnotatedServicesHelper(this.dataStore.getDataObservable('platform.services'))
    }

    getSelectableCategories(): Observable<SelectableData[]> {
        return this.dataStore.getDataObservable('platform.service.categories').map(categories => {
            return categories.sort((cat1, cat2) => { return cat1.name < cat2.name ? -1 : 1; }).map(category =>
                new SelectableData(category._id, category.name)
            )
        });
    }

    createCategory(newCategory): void {
        this.dataStore.addData('platform.service.categories', { 'name': newCategory });
    }




    // Identical or similar services
    // ==============================

    getAnnotatedServicesIdenticalTo(serviceId) {
        return this.getAnnotatedServicesHelper(this.getIdenticalServices(serviceId, this.areServiceIdenticals))
    }

    getAnnotatedServicesSimilarTo(serviceId) {
        return this.getAnnotatedServicesHelper(this.getIdenticalServices(serviceId, this.areServiceSimilars))
    }

    private areServiceIdenticals(service1, service2, stepMap: Map<string, any[]>): boolean {
        if (service1.categoryId !== service2.categoryId) return false

        var irrelevantFields = ['serviceId', 'name', 'description', 'isDisabled']

        var steps1 = (stepMap.get(service1._id) || []).map(s => utilsComparator.stripDbInfo(s, irrelevantFields))
        var steps2 = (stepMap.get(service2._id) || []).map(s => utilsComparator.stripDbInfo(s, irrelevantFields))

        return utilsComparator.compare(steps1, steps2)
    }

    private areServiceSimilars(service1, service2, stepMap: Map<string, any[]>, self): boolean {
        if (self.areServiceIdenticals(service1, service2, stepMap)) return false

        var steps1 = (stepMap.get(service1._id) || [])
        var steps2 = (stepMap.get(service2._id) || [])

        return Math.abs(steps1.length - steps2.length) <= 1
    }


    private getIdenticalServices(serviceId, fnComparator): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('platform.services'),
            this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(s => !s.isDisabled)),
            (services, steps) => {
                var service = services.filter(s => s._id === serviceId)[0]
                if (!service) return []

                var stepMap = steps.reduce((map: Map<string, any[]>, s: any) => {
                    if (!map.has(s.serviceId)) map.set(s.serviceId, [])
                    var arr = map.get(s.serviceId)
                    arr.push(s)
                    map.set(s.serviceId, arr)
                    return map
                }, new Map())

                var x = services.filter(s => s._id !== serviceId).filter(s => fnComparator(s, service, stepMap, this))
                return x
            })
    }

    // Cost calculation
    // =================

    getServicesCostInfo(): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps')).map(steps => {
            return steps.filter(step => !step.data.isDisabled).reduce((map: Map<string, number>, step) => {
                if (!map.has(step.data.serviceId)) map.set(step.data.serviceId, 0)
                map.set(step.data.serviceId, map.get(step.data.serviceId) + step.annotation.grandTotalCost)
                return map
            }, new Map())
        })
    }

    getSnapshotpsCostInfo(): Observable<any> {
        return this.dataStore.getDataObservable('platform.service.step.snapshots').map(steps => {
            return steps.filter(step => !step.data.isDisabled).reduce((map: Map<string, number>, step) => {
                if (!map.has(step.serviceId)) map.set(step.serviceId, 0)
                map.set(step.serviceId, map.get(step.serviceId) + (step.annotation.grandTotalCostOnStandard || step.annotation.grandTotalCost || step.annotation.totalCost || 0))
                return map
            }, new Map())
        })
    }


    // Copy services...
    // =================

    cloneService(serviceId: string, newName: string, newDescription: string): Observable<any> {
        return this.dataStore.getDataObservable('platform.services').map(services => services.filter(s => s._id === serviceId)[0]).first()
            .switchMap(service => {
                var service2 = utilsComparator.clone(service)
                service2.name = newName
                service2.description = newDescription
                delete service2._id
                return Observable.forkJoin(this.dataStore.addData('platform.services', service2), this.getAnnotatedServiceStepsByService(serviceId).first())
            }).switchMap(res => {
                var newServiceId = res[0]._id
                var steps: any[] = res[1].map(annotatedStep => annotatedStep.data)
                steps.forEach(step => {
                    step.serviceId = newServiceId
                    delete step._id
                })
                return Observable.forkJoin(steps.map(step => this.dataStore.addData('platform.service.steps', step)))
            })
    }


    snapshotService(serviceId: string, version: string, description: string): Observable<any> {
        return this.getAnnotatedServices().map(services => services.filter(s => s.data._id === serviceId)[0]).first()
            .switchMap(service => {
                var service2 = utilsComparator.clone(service)
                service2.version = version
                service2.serviceId = serviceId
                service2.description = description
                return Observable.forkJoin(this.dataStore.addData('platform.service.snapshots', service2), this.getAnnotatedServiceStepsByService(serviceId).first())
            }).switchMap(res => {
                var newServiceId = res[0]._id
                var steps: any[] = res[1]
                steps.forEach(step => {
                    step.serviceId = newServiceId
                })
                return Observable.forkJoin(steps.map(step => this.dataStore.addData('platform.service.step.snapshots', step)))
            })
    }

    // Other misc annotation
    // =======================

    getAnnotatedMachines() {
        return Observable.combineLatest(this.dataStore.getDataObservable('platform.machines'), (machines) => {
            return machines.map(machine => {
                var annualAmortisation = +machine.price / +machine.lifetime
                var nbHoursPerYear = +machine.hoursPerDay * 365 * +machine.occupancy / 100
                var annualCost = annualAmortisation + +machine.maintenancePrice
                return {
                    data: machine,
                    annotation: {
                        annualAmortisation: annualAmortisation,
                        annualCost: annualCost,
                        nbHoursPerYear: nbHoursPerYear,
                        costOfHour: annualCost / nbHoursPerYear
                    }
                }
            })
        })
    }

    getCorrectionsOfClientType(clientTypeId, clients, corrections) {
        var client = clients.filter(c => c._id === clientTypeId)[0]
        return corrections.map(corr => {
            var customCor = (!client || !client.corrections) ? null : client.corrections.filter(cc => cc.id === corr._id)[0]
            return {
                id: corr._id,
                name: corr.name,
                perCent: customCor ? customCor.perCent : corr.defaultPerCent,
                isDefault: !customCor,
                data: corr
            }
        })
    }
}



