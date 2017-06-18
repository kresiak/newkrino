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
        let machine = machines.filter(machine => serviceStep.machineId === machine._id)[0]

        return {
            data: serviceStep,
            annotation:
            {
                serviceName: (service || {}).name,
                serviceDescription: (service || {}).description,
                machineName: (machine || {}).name,
                total: (serviceStep.products || []).reduce((acc, p) => {
                        let unitPrice= productMap.has(p.id) ? productMap.get(p.id).price : 0
                        return acc + unitPrice * p.quantity
                    } , 0),
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
            this.dataStore.getDataObservable('platform.machines'),
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
    

}