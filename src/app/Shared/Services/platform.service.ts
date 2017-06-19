import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import { AuthService } from './auth.service'
import { SelectableData } from './../Classes/selectable-data'
import { Observable, Subscription, ConnectableObservable } from 'rxjs/Rx'
import * as moment from "moment"
import * as utils from './../Utils/observables'


Injectable()
export class PlatformService {
    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) { }


    private createAnnotatedServiceStep(serviceStep, services: any[], machines, productMap: Map<string, any>) {
        if (!serviceStep) return null;

        let service = services.filter(service => serviceStep.serviceId === service._id)[0]
        let machine = machines.filter(machine => serviceStep.machineId === machine.data._id)[0]

        let  productsCost= (serviceStep.products || []).reduce((acc, p) => {
                        let unitPrice= productMap.has(p.id) ? productMap.get(p.id).price : 0
                        return acc + unitPrice * p.quantity
                    } , 0)

        return {
            data: serviceStep,
            annotation:
            {
                serviceName: (service || {}).name,
                serviceDescription: (service || {}).description,
                machineName: (machine.data || {}).name,
                machineCost: (machine.annotation || {}).costOfRun,
                productsCost: productsCost,
                totalCost: productsCost + (machine.annotation || {}).costOfRun,
                products: (serviceStep.products || []).map(prod => {
                    let unitPrice= productMap.has(prod.id) ? productMap.get(prod.id).price : -1
                    return {
                        data: prod,
                        annotation: {
                            product: productMap.has(prod.id) ? productMap.get(prod.id).name : 'unknown product', 
                            productPrice: unitPrice, 
                            productTotal: prod.quantity * unitPrice                           
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
            (serviceSteps, services, machines, productMap) => {
                return serviceSteps.map(serviceStep => this.createAnnotatedServiceStep(serviceStep, services, machines, productMap))
            });
    }
    

    getAnnotatedServiceStepsByService(serviceId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step.serviceId===serviceId)))
    }
    
    getAnnotatedServiceStep(serviceStepId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step._id===serviceStepId))).map(steps => steps[0])
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
        return this.dataStore.getDataObservable('platform.services').map(services => services.filter(s => s._id===serviceId)[0]).first()
            .switchMap(service => {
                service.name= newName
                service.description= newDescription
                delete service._id
                return Observable.forkJoin(this.dataStore.addData('platform.services', service), this.getAnnotatedServiceStepsByService(serviceId).first())
            }).switchMap(res => {
                var newServiceId= res[0]._id
                var steps: any[]= res[1].map(annotatedStep => annotatedStep.data)
                steps.forEach(step => {
                    step.serviceId= newServiceId
                    delete step._id
                })
                return Observable.forkJoin(steps.map(step => this.dataStore.addData('platform.service.steps', step)))
            })
    }


    snapshotService(serviceId: string, version: string): Observable<any>  {
        return this.dataStore.getDataObservable('platform.services').map(services => services.filter(s => s._id===serviceId)[0]).first()
            .switchMap(service => {
                service.version= version
                service.serviceId= serviceId
                delete service._id
                return Observable.forkJoin(this.dataStore.addData('platform.service.snapshots', service), this.getAnnotatedServiceStepsByService(serviceId).first())
            }).switchMap(res => {
                var newServiceId= res[0]._id
                var steps: any[]= res[1]
                steps.forEach(step => {
                    step.serviceId= newServiceId
                })
                return Observable.forkJoin(steps.map(step => this.dataStore.addData('platform.service.step.snapshots', step)))
            })
    }


    getAnnotatedMachines() {
        return Observable.combineLatest(this.dataStore.getDataObservable('platform.machines'), (machines) => {
            return machines.map(machine => {
                var annualAmortisation= +machine.price / +machine.lifetime
                var nbHoursPerYear= +machine.hoursPerDay * 365 * +machine.occupancy / 100
                var annualCost= annualAmortisation + +machine.maintenancePrice
                var nbRunsPerYear= nbHoursPerYear / +machine.runtime
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

}