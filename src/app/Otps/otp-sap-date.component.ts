import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs/Rx'
import { SapService } from './../Shared/Services/sap.service'
import * as moment from "moment"

@Component({
    selector: 'gg-sap-by-date',
    templateUrl: './otp-sap-date.component.html'
})
export class OtpSapByDateComponent implements OnInit {
    constructor(private sapService: SapService) { }

    @Input() otp: string;

    //private sapItemsSubscription: Subscription
    private sapItems
    private sapTvacTotal: number
    private intialdate = '01/01/2015'

    private dateSaved = new EventEmitter();

    ngOnInit(): void {
        this.dateSaved.subscribe(newDate => {
            this.sapService.getSapItemsObservableByOtpAndDate(this.otp, newDate).first().subscribe(res => {
                this.sapItems = res
                this.sapTvacTotal = this.sapItems.reduce((acc, item) => {
                    if (item.mainData.annotation.otpMap.has(this.otp)) {
                        acc += item.mainData.annotation.otpMap.get(this.otp).totalTvac
                    }
                    return acc
                }, 0)
            })
        })
        this.dateSaved.next(this.intialdate)
    }

    ngOnDestroy(): void {
        //this.sapItemsSubscription.unsubscribe()
    }

    dateChanged(newDate) {        
        this.dateSaved.next(moment(newDate, 'DD/MM/YYYY HH:mm:ss').format('DD/MM/YYYY'))
    }
}