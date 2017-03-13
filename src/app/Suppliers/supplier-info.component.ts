import { Component, OnInit, Input } from '@angular/core'
import { ActivatedRoute, Params, Router } from '@angular/router'
import { ProductService } from './../Shared/Services/product.service'
import { OrderService } from './../Shared/Services/order.service'
import { SupplierService } from './../Shared/Services/supplier.service'
import { AuthenticationStatusInfo, AuthService } from './../Shared/Services/auth.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        selector: 'gg-supplier-info',
        templateUrl: './supplier-info.component.html'
    }
)

export class SupplierInfoComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    constructor(private orderService: OrderService, private supplierService: SupplierService, private productService: ProductService, private route: ActivatedRoute, private authService: AuthService, private router: Router) {
    }

    @Input() supplier; 
  
}