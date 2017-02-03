import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Observable } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service';
import { UserService } from './../Shared/Services/user.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-otp-detail',
        templateUrl: './otp-detail.component.html'
    }
)
export class OtpDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private userService: UserService,
        private chartService: ChartService, private navigationService: NavigationService, private router: Router, private authService: AuthService) {
    }
    private pieSpentChart;

    @Input() otpObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean=false
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
                this.orderService.hasOtpAnyOrder(otp.data._id).subscribe(anyOrder => this.anyOrder = anyOrder);
            }
        });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
    }

    //private model;
    private otp;
    private ordersObservable;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;
    private authorizationStatusInfo: AuthenticationStatusInfo;

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
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/otp', this.otp.data._id, this.path, this.isRoot)
            return
        }
        if ($event.nextId === 'gotoTop') {
            $event.preventDefault();
            this.navigationService.jumpToTop()
            return
        }        
        
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childOrdersStateChanged($event) {
        this.state.Orders = $event;
        this.stateChanged.next(this.state);
    }

    dateUpdated(date) {
        this.otp.data.datEnd = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    dateUpdatedStart(date) {
        this.otp.data.datStart = date;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    nameUpdated(name) {
        this.otp.data.name = name;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    budgetUpdated(budget) {
        this.otp.data.budget = budget;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    blockedUpdated(block) {
        this.otp.data.isBlocked = block;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    closedUpdated(close) {
        this.otp.data.isClosed = close;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }
}