import {Observable} from 'rxjs/Rx';
import {Injectable, Inject} from '@angular/core'
import { DataStore } from './data.service'

@Injectable()
export class AdminService{

    constructor(@Inject(DataStore) private dataStore: DataStore)
    {

    }

    getLabo(): Observable<any> {
        return Observable.combineLatest(
            this.dataStore.getDataObservable('labos'),
            (labos) => {
                if (!labos || labos.length===0){
                    return {
                        name: '',
                        adminIds: [],
                        secrExecIds: [],
                        validationSteps: []
                    }
                }
                else {
                    return labos[0]
                }
            });
    }
    
}