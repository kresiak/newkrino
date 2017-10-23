import { Injectable, Inject } from '@angular/core'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { DataStore } from '../../Shared/Services/data.service'

@Injectable()
export class XeniaWelcomeService {
    constructor( @Inject(DataStore) private dataStore: DataStore) { }

    private data: any= {}

    public setNameData(name: string='', firstName: string= '') {
        this.data.name= name
        this.data.firstName= firstName
    }

    public getData() {
        return this.data
    }

    private nextSubject: BehaviorSubject<any>= new BehaviorSubject<any>({
        text: 'next page',
        enabled: false,
        fnExec: undefined
    })

    public getNextObservable(): Observable<any> {
        return this.nextSubject
    }

    public nextDisable() {
        var x= this.nextSubject.getValue()
        x.enabled= false
        x.fnExec= undefined
        this.nextSubject.next(x)
    }

    public nextSetText(txt: string) {
        var x= this.nextSubject.getValue()
        x.text= txt
        this.nextSubject.next(x)        
    }

    public nextEnable(fnExec) {
        var x= this.nextSubject.getValue()
        x.enabled= true
        x.fnExec= fnExec
        this.nextSubject.next(x)
    }

    
}
