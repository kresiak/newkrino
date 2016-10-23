import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Params } from '@angular/router'
import {OrderService} from '../Shared/Services/order.service'
import { Observable } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './order.component.html'        
    }
)
export class OrderComponent implements OnInit
{
    constructor(private orderService: OrderService, private route: ActivatedRoute)
    {

    }

    ngOnInit() : void{
        this.route.params.subscribe((params: Params) => {
            let orderId = params['id'];
            if (orderId) {                
                this.orderService.getAnnotedOrder(orderId).subscribe(order => 
                this.order = order
                );
            }
        });
    }

    private order;
}
