import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { ProductService } from '../Shared/Services/product.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './product-detail.routable.component.html'        
    }
)
export class ProductDetailComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private route: ActivatedRoute) { }

    product: any
    lastPath: string

    productObservable: Observable<any>;
    initData(id: string) {
        if (id) {
            this.productObservable = this.productService.getAnnotatedProductsWithBasketInfoById(id);
            this.productObservable.subscribe(obj => {
                this.product = obj
            })
        }
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(queryParams => {
            this.lastPath = queryParams['path'];
        })
        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
    }
    
}
