import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectableData } from '../../Shared/Classes/selectable-data'
import { OrderService } from '../../Shared/Services/order.service'
import { ProductService } from '../../Shared/Services/product.service'

import { DataStore } from '../../Shared/Services/data.service';
//import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthenticationStatusInfo, AuthService } from '../../Shared/Services/auth.service'
import { Observable, Subscription } from 'rxjs/Rx'

@Component(
    {
        selector: 'gg-monitoring-detail',
        templateUrl: './monitoring-detail.component.html'
    }
)

export class MonitoringDetailComponent implements OnInit {

    constructor(private orderService: OrderService, private productService: ProductService, private authService: AuthService, private dataStore: DataStore ) {}

    ngOnInit(): void {
        this.selectableUsers = this.authService.getSelectableUsers();
        this.selectableEquipes = this.orderService.getSelectableEquipes();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectableOtps = this.orderService.getSelectableOtps();
    }

    private selectableUsers: Observable<SelectableData[]>;
    private selectableEquipes: Observable<any>;
    private selectableCategoriesObservable: Observable<any>;
    private selectableOtps: Observable<SelectableData[]>;

    userSelectionChanged(user) {

    }

    userExpensesChanged(sumUser) {

    }

    equipeSelectionChanged(equipe) {

    }

    equipeExpensesChanged(sumEquipe) {

    }

    categorySelectionChanged(category) {

    }

    categoryExpensesChanged(sumCategory) {

    }

    otpSelectionChanged(otp) {

    }

    otpExpensesChanged(sumOtp) {

    }

    

}
