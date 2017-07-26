import { Injectable } from '@angular/core'
import { ReplaySubject } from "rxjs/Rx";
import { Observable, Subscription } from 'rxjs/Rx'

import { ApiService } from './api.service';


@Injectable()

export class DataStore { // contains one observable property by database table/collection

    constructor(private apiService: ApiService) {
        var laboFromLS = localStorage.getItem(this.LSLaboKey)
        if (laboFromLS) {
            this.laboName= laboFromLS            
        }        
        this.emitLaboName()
    }

    private laboNameSubject: ReplaySubject<string> = new ReplaySubject(1)

    public getLaboNameObservable() : Observable<any> {
        return this.laboNameSubject
    }

    private emitLaboName() {
        this.laboNameSubject.next(this.laboName)
    }

    private laboFieldName: string = 'laboName'

    private universalTables: string[] = ['products', 'suppliers', 'categories', 'labos.list']

    //public laboName= 'demo' 
    //public laboName = 'michel'
    private laboName: string = undefined // = 'genomics'
    private LSLaboKey: string = 'krinoLabo'
    

    public getLaboName() : string {
        return this.laboName
    }

    public setLaboName(labo: string) {
        this.laboName= labo
        localStorage.setItem(this.LSLaboKey, labo)
        this.RetriggerAll()
        this.emitLaboName()
    }

    private isFromRightLabo(table, rec): boolean {
        if (this.universalTables.includes(table)) return true
        let laboNameInRecord = rec[this.laboFieldName]
        if (this.laboName === 'michel') return !laboNameInRecord || laboNameInRecord === this.laboName
        return laboNameInRecord === this.laboName
    }


    public RetriggerAll() {
        Object.keys(this).forEach(propName => {
            if (this[propName] instanceof ReplaySubject && propName != 'laboNameSubject') {
                this.triggerNext(propName)
            }
        })
    }

    private triggerNext(table: string) {
        if (!this[table]) {
            this[table] = new ReplaySubject<any[]>(1);
        }

        this.apiService.crudGetRecords(table).subscribe(
            res => {
                var res2 = res.filter(record => this.isFromRightLabo(table, record))
                this[table].next(res2);
            },
            err => console.log("Error retrieving Todos"),
            () => console.log("completed " + table)
        );
    }

    setLaboNameOnRecord(record) {
        record[this.laboFieldName] = this.laboName
    }

    private getObservable(table: string): ReplaySubject<any[]> {
        if (!this[table]) {
            this[table] = new ReplaySubject<any[]>(1);
            this.triggerNext(table);
        }
        return this[table];
    }

    getDataObservable(table: string) {
        return this.getObservable(table);
    }

    addData(table: string, newRecord: any): Observable<any> {
        newRecord[this.laboFieldName] = this.laboName
        let obs = this.apiService.crudCreateRecord(table, newRecord);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    };

    deleteData(table: string, id: string): Observable<any> {
        let obs = this.apiService.crudDeleteRecord(table, id);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    }

    updateData(table: string, id: string, newRecord: any): Observable<any> {
        newRecord[this.laboFieldName] = this.laboName   // to be sure
        let obs = this.apiService.crudUpdateRecord(table, id, newRecord);
        obs.subscribe(res => {
            //this.triggerNext(table)
        });
        return obs;
    }

    triggerDataNext(table: string) {
        this.triggerNext(table);
    }


}