import { Observable } from 'rxjs/Rx';
import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'

@Injectable()
export class AdminService {

    constructor( @Inject(DataStore) private dataStore: DataStore) {

    }

    getLabo(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('labos'),
            (labos) => {
                if (!labos || labos.length === 0) {
                    return {
                        data: {
                            name: '',
                            adminIds: [],
                            secrExecIds: [],
                            validationSteps: []
                        },
                        annotation: {
                            validationSteps: this.getPossibleSteps()
                        }
                    }
                }
                else {
                    return{
                        data: labos[0],
                        annotation: {
                            validationSteps: this.getSteps(labos[0].validationSteps || [])
                        }
                    }
                }
            });
    }

    private getPossibleSteps():any[] {
        return [
            {
                name: "EquipeHead",
                enabled: false
            },
            {
                name: "Equipe",
                enabled: false,
                equipeId: undefined
            },
            {
                name: "SecrExec",
                enabled: false
            }
        ]    
    }

    private getSteps(stepsFromDb: any[]): any[] {
        var steps: any[]= stepsFromDb.map(s => s)
        steps.forEach(step => {
            step.enabled= true
        })
        this.getPossibleSteps().filter(possibleStep=> !steps.map(step => step.name).includes(possibleStep.name)).forEach(stepToAdd => {
            steps.push(stepToAdd)
        })
        return steps
    }

}