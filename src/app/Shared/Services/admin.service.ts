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

    canUserValidateStep(annotatedUser, annotatedLabo, validationStepName: string, orderingEquipeId: string) : boolean {
        if (validationStepName === "SecrExec") return annotatedUser.annotation.isSecrExec;
        if (validationStepName === "Equipe") {
            var step= annotatedLabo.data.validationSteps.filter(step => step.name==='Equipe')[0]
            if (!step || !step.equipeId) return false
            return annotatedUser.annotation.equipes.map(eq => eq._id).includes(step.equipeId);
        }
        if (validationStepName === "EquipeHead") {
            return annotatedUser.annotation.equipesLeading && orderingEquipeId && annotatedUser.annotation.equipesLeading.includes(orderingEquipeId)
        }
        return false
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