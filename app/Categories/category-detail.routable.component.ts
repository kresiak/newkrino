import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { ProductService } from '../Shared/Services/product.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'

@Component(
    {
        moduleId: module.id,
        templateUrl: './category-detail.routable.component.html'
    }
)
export class CategoryDetailComponentRoutable implements OnInit {
    constructor(private productService: ProductService, private route: ActivatedRoute, private navigationService: NavigationService, private authService: AuthService) { }

    category: any
    state: {}

    private authorizationStatusInfo: AuthenticationStatusInfo;

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
        this.navigationService.getStateObservable().subscribe(state => {
            this.state= state
        })        

        this.route.params.subscribe((params: Params) => {
            let id = params['id'];
            this.initData(id)
        });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
    }

}
