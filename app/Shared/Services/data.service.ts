import { Injectable } from '@angular/core'
import { BehaviorSubject } from "rxjs/Rx";
import { Observable } from 'rxjs/Rx'

import { ApiService } from './api.service';



@Injectable()
export class DataObservables {
    constructor(private apiService: ApiService) {
    }

    triggerNext(table: string) {
        if (this[table]) {
            this.apiService.crudGetRecords(table).subscribe(
                res => {
                    this[table].next(res);
                },
                err => console.log("Error retrieving Todos")
            );
        }
        else {
            console.log('DataObservables triggerNext ERROR');
        }
    }

    getObservable(table: string): BehaviorSubject<any[]> {
        if (!this[table]) {
            this[table] = new BehaviorSubject<any[]>([]);
            this.triggerNext(table);
        }
        return this[table];
    }
}

@Injectable()
export class DataStore {

    constructor(private apiService: ApiService, private dataObservables: DataObservables) {
    }

    getDataObservable(table: string) {
        return this.dataObservables.getObservable(table);
    }

    addData(table: string, newRecord: any): Observable<any> {
        let obs = this.apiService.crudCreateRecord(table, newRecord);
        obs.subscribe(res => this.dataObservables.triggerNext(table));
        return obs;
    };

    deleteData(table: string, id: string): Observable<any> {
        let obs= this.apiService.crudDeleteRecord(table, id);
        obs.subscribe(res => this.dataObservables.triggerNext(table));
        return obs;
    }

    updateData(table: string, id: string, newRecord: any): Observable<any> {
        let obs= this.apiService.crudUpdateRecord(table, id,newRecord);
        obs.subscribe(res => 
        {
            this.dataObservables.triggerNext(table)
        }        
        );
        return obs;
    }

}