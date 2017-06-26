import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'
import * as utilsComparator from './../Utils/comparators'


Injectable()
export class PlatformService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) { }


    private createAnnotatedServiceStep(serviceStep, services: any[], machines, productMap: Map<string, any>, labourTypes, clients, corrections) {
        if (!serviceStep) return null;

        let service = services.filter(service => serviceStep.serviceId === service._id)[0]
        let correctionsFactors= this.getCorrectionsOfClientType(service.clientTypeId, clients, corrections)

        let machine = machines.filter(machine => serviceStep.machineId === machine.data._id)[0] || {}

        // products 
        // ========

        let productsCost = (serviceStep.products || []).reduce((acc, p) => {
            let unitPrice = productMap.has(p.id) ? productMap.get(p.id).price : 0
            return acc + unitPrice * p.quantity
        }, 0)

        let productsExtras = correctionsFactors.filter(cf => cf.data.isOnProduct).map(cf => {
            return {
                labeltxt: cf.name + ' (' + cf.perCent + '%)',
                extraValue: cf.perCent / 100 * productsCost
            }
        })
        let sumProductsExtras = productsExtras.reduce((acc, pe) => acc + +pe.extraValue, 0)

        // labour
        // ======

        let labourCost = (serviceStep.labourTypes || []).reduce((acc, ltInDb) => {
            let labourType = labourTypes.filter(lt => lt._id === ltInDb.id)[0]
            let unitPrice = labourType ? labourType.hourlyRate : 0
            return acc + unitPrice * ltInDb.nbHours
        }, 0)

        let labourReductions = correctionsFactors.filter(cf => cf.data.isOnLabour).map(cf => {
            return {
                labeltxt: cf.name + ' (' + cf.  perCent + '%)',
                extraValue: -(100 - cf.perCent) / 100 * labourCost
            }
        })
        let sumLabourReduction = labourReductions.reduce((acc, pe) => acc + +pe.extraValue, 0)

        // totals
        // ======

        let total= labourCost + sumLabourReduction + productsCost + sumProductsExtras + ((machine && machine.annotation) ?  machine.annotation.costOfRun : 0)

        let totalExtras = correctionsFactors.filter(cf => cf.data.isOnTotal).map(cf => {
            return {
                labeltxt: cf.name + ' (' + cf.perCent + '%)',
                extraValue: cf.perCent / 100 * total
            }
        })

        let sumOfTotalExtras = totalExtras.reduce((acc, pe) => acc + +pe.extraValue, 0)

        return {
            data: serviceStep,
            annotation:
            {
                serviceName: (service || {}).name,
                serviceDescription: (service || {}).description,
                machineName: (machine.data || {}).name,
                machineCost: (machine && machine.annotation) ?  machine.annotation.costOfRun : 0,
                productsCost: productsCost,
                productsExtras: productsExtras,
                labourCost: labourCost,
                labourReductions: labourReductions,
                totalCost: total,   
                totalExtras: totalExtras,  
                grandTotalCost: total + sumOfTotalExtras,           
                products: (serviceStep.products || []).map(prod => {
                    let unitPrice = productMap.has(prod.id) ? productMap.get(prod.id).price : -1
                    return {
                        data: prod,
                        annotation: {
                            product: productMap.has(prod.id) ? productMap.get(prod.id).name : 'unknown product',
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
            (serviceSteps, services, machines, productMap, labourTypes, clients, corrections) => {
                return serviceSteps.map(serviceStep => this.createAnnotatedServiceStep(serviceStep, services, machines, productMap, labourTypes, clients, corrections))
            });
    }


    getAnnotatedServiceStepsByService(serviceId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step.serviceId === serviceId)))
    }

    getAnnotatedServiceStep(serviceStepId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step._id === serviceStepId))).map(steps => steps[0])
    }

    getAnnotatedServices(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('platform.services'),
            this.dataStore.getDataObservable('platform.client.types'), 
            this.dataStore.getDataObservable('platform.correction.types'),
            (services, clients, corrections) => {                
                return services.map(service => {
                    let correctionsFactors= this.getCorrectionsOfClientType(service.clientTypeId, clients, corrections)
                    let clientType= clients.filter(ct => ct._id===service.clientTypeId)[0]
                    return {
                        data: service,
                        annotation: {
                            correctionsFactors: correctionsFactors,
                            clientType: clientType ? clientType.name : 'no client type selected, default corrections'
                        }
                    }
                })
            });
    }

    getServicesCostInfo(): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps')).map(steps => {
            return steps.reduce((map: Map<string, number>, step) => {
                if (!map.has(step.data.serviceId)) map.set(step.data.serviceId, 0)
                map.set(step.data.serviceId, map.get(step.data.serviceId) + step.annotation.totalCost)
                return map
            }, new Map())
        })
    }

    getSnapshotpsCostInfo(): Observable<any> {
        return this.dataStore.getDataObservable('platform.service.step.snapshots').map(steps => {
            return steps.reduce((map: Map<string, number>, step) => {
                if (!map.has(step.serviceId)) map.set(step.serviceId, 0)
                map.set(step.serviceId, map.get(step.serviceId) + step.annotation.totalCost)
                return map
            }, new Map())
        })
    }

    cloneService(serviceId: string, newName: string, newDescription: string): Observable<any> {
        return this.dataStore.getDataObservable('platform.services').map(services => services.filter(s => s._id === serviceId)[0]).first()
            .switchMap(service => {
                var service2= utilsComparator.clone(service)
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
                var service2= utilsComparator.clone(service)
                service2.version = version
                service2.serviceId = serviceId
                service2.description= description
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


    getAnnotatedMachines() {
        return Observable.combineLatest(this.dataStore.getDataObservable('platform.machines'), (machines) => {
            return machines.map(machine => {
                var annualAmortisation = +machine.price / +machine.lifetime
                var nbHoursPerYear = +machine.hoursPerDay * 365 * +machine.occupancy / 100
                var annualCost = annualAmortisation + +machine.maintenancePrice
                var nbRunsPerYear = nbHoursPerYear / +machine.runtime
                return {
                    data: machine,
                    annotation: {
                        annualAmortisation: annualAmortisation,
                        annualCost: annualCost,
                        nbHoursPerYear: nbHoursPerYear,
                        nbRunsPerYear: nbRunsPerYear,
                        costOfRun: annualCost / nbRunsPerYear
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



