import { Component, Input, Output, OnInit, ViewChild } from '@angular/core'
import { DataStore } from './../Shared/Services/data.service'
import { AuthService } from '../Shared/Services/auth.service'
import { OrderService } from '../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'

@Component({
    selector: 'gg-equipe-gift-grid',
    templateUrl: './equipe-gift-grid.component.html'
})
export class EquipeGiftGridComponent implements OnInit {


    constructor(private dataStore: DataStore, private authService: AuthService, private orderService: OrderService) {

    }

    @Input() equipeGiftsObservable: Observable<any>

    private equipeGifts: any[]

    ngOnInit(): void {
        this.equipeGiftsObservable.subscribe(res => {
            this.equipeGifts= res
        })
    }

}

