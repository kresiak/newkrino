import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { ProductService } from '../Shared/Services/product.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'

@Component(
    {
        moduleId: module.id,
        templateUrl: './category-detail.routable.component.html'        
    }
)
export class CategoryDetailComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private route: ActivatedRoute) { }

    category: any
    lastPath: string

    categoryObservable: Observable<any>;
    initData(id: string) {
        if (id) {
            this.categoryObservable = this.productService.getAnnotatedCategoriesById(id);
            this.categoryObservable.subscribe(obj => {
                this.category = obj
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
