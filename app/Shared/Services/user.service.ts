import { Injectable, Inject } from '@angular/core'
import { DataStore } from './data.service'
import {AuthService} from './auth.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'


@Injectable()
export class UserService {
    readonly symOtp= 'otp'
    readonly symTableDashlets= 'dashlets'

    constructor( @Inject(DataStore) private dataStore: DataStore, @Inject(AuthService) private authService: AuthService) { }

    private createDashletForCurrentUser(category: string, id: string)
    {
        let userId= this.authService.getUserId();

        this.dataStore.getDataObservable(this.symTableDashlets).first().subscribe(dashlets =>
        {
            if (dashlets.filter(dashlet => dashlet.user === userId && dashlet.category === category && dashlet.id === id).length === 0)
            {
                this.dataStore.addData(this.symTableDashlets, { user: userId, category: category, id: id });
            }
        });        
    }    

    createOtpDashletForCurrentUser(otpId: string)
    {
        return this.createDashletForCurrentUser(this.symOtp, otpId);
    }

    removeDashletForCurrentUser(dbid)
    {
        this.dataStore.getDataObservable(this.symTableDashlets).map(dashlets => dashlets.filter(dashlet => dashlet._id === dbid)).subscribe(dashlets =>
        {
            if (dashlets.length > 0)
            {
                let userId= this.authService.getUserId();
                let dashlet= dashlets[0];
                if (dashlet.user===userId)
                {
                    this.dataStore.deleteData(this.symTableDashlets, dbid);
                }
            }
        });                
    }

    getDashletsForCurrentUser() : Observable<any>
    {
        return Observable.combineLatest(this.dataStore.getDataObservable(this.symTableDashlets), this.authService.getUserIdObservable(), (dashlets, userId) => {
            return dashlets.filter(dashlet => dashlet.user === userId);
        });
    }

    getOtpDashletsForCurrentUser() : Observable<any>
    {
        return this.getDashletsForCurrentUser().map(dashlets => dashlets.filter(dashlet => dashlet.category===this.symOtp))
    }
}