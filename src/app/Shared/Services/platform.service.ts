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


    private createAnnotatedServiceStep(serviceStep, services: any[]) {
        if (!serviceStep) return null;

        let service = services.filter(service => serviceStep.serviceId === service._id)[0];

        return {
            data: serviceStep,
            annotation:
            {
                serviceName: (service || {}).name,
                serviceDescription: (service || {}).description
            }
        };
    }


    getAnnotatedServiceSteps(serviceId: string): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('platform.service.steps').map(steps => steps.filter(step => step.serviceId===serviceId)),
            this.dataStore.getDataObservable('platform.services'),
            (serviceSteps, services) => {
                return serviceSteps.map(serviceStep => this.createAnnotatedServiceStep(serviceStep, services))
            });
    }

}