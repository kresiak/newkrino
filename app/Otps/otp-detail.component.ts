import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service';
import { UserService } from './../Shared/Services/user.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component(
    {
        moduleId: module.id,
        selector: 'gg-otp-detail',
        templateUrl: './otp-detail.component.html'
    }
)

export class OtpDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private userService: UserService,
        private chartService: ChartService) {
    }
    private pieSpentChart;

    @Input() otpObservable: Observable<any>;
    @Input() state;
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }


    ngOnInit(): void {
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.otpObservable.map(otp => otp.data.categoryIds);
        this.otpObservable.subscribe(otp => {
            this.otp = otp;
            if (otp) {
                this.pieSpentChart = this.chartService.getSpentPieData(this.otp.annotation.amountSpent / this.otp.annotation.budget * 100);
                this.ordersObservable = this.orderService.getAnnotedOrdersByOtp(otp.data._id);
                this.ordersObservable.subscribe(orders => this.anyOrder = orders && orders.length > 0);
            }
        });
    }


    private otp;
    private ordersObservable;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;

    categorySelectionChanged(selectedIds: string[]) {
        this.otp.data.categoryIds = selectedIds;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    categoryHasBeenAdded(newCategory: string) {
        this.productService.createCategory(newCategory);
    }

    setDashlet() {
        this.userService.createOtpDashletForCurrentUser(this.otp.data._id);
    }

    removeDashlet(dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    }

    commentsUpdated(comments) {
        if (this.otp && comments) {
            this.otp.data.comments = comments;
            this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
        }

    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childOrdersStateChanged($event)
    {
        this.state.Orders= $event;
        this.stateChanged.next(this.state);
    }
    
    dateUpdated(date: string) {
        if (this.otp.data.date !== date) {
            this.otp.data.date = date;
            this.productService.updateProduct(this.otp.data);
        }
    }
}