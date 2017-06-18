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


    private createAnnotatedServiceStep(serviceStep, services: any[], machines) {
        if (!serviceStep) return null;

        let service = services.filter(service => serviceStep.serviceId === service._id)[0]
        let machine = machines.filter(machine => serviceStep.machineId === machine._id)[0]

        return {
            data: serviceStep,
            annotation:
            {
                serviceName: (service || {}).name,
                serviceDescription: (service || {}).description,
                machineName: (machine || {}).name
            }
        };
    }


    private getAnnotatedServiceSteps(stepObservable: Observable<any>): Observable<any> {
        return Observable.combineLatest(
            stepObservable,
            this.dataStore.getDataObservable('platform.services'),
            this.dataStore.getDataObservable('platform.machines'),
            (serviceSteps, services, machines) => {
                return serviceSteps.map(serviceStep => this.createAnnotatedServiceStep(serviceStep, services, machines))
            });
    }

    getAnnotatedServiceStepsByService(serviceId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step.serviceId===serviceId)))
    }
    
    getAnnotatedServiceStep(serviceStepId: string): Observable<any> {
        return this.getAnnotatedServiceSteps(this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step._id===serviceStepId))).map(steps => steps[0])
    }
    

}