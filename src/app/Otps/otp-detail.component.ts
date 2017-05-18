import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service';
import { UserService } from './../Shared/Services/user.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { SapService } from './../Shared/Services/sap.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-otp-detail',
        templateUrl: './otp-detail.component.html'
    }
)
export class OtpDetailComponent implements OnInit {
    constructor(private dataStore: DataStore, private productService: ProductService, private orderService: OrderService, private userService: UserService,
        private chartService: ChartService, private navigationService: NavigationService, private router: Router, private authService: AuthService, private sapService: SapService,
        private formBuilder: FormBuilder) {
    }
    private pieSpentChart;
    private annualForm: FormGroup;
    private datStartAnnual: string 
    private datEndAnnual: string
    
    @Input() otpObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false
    @Output() stateChanged = new EventEmitter()

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    private equipeListObservable
    private otp;
    private otpBudget;
    private sapIdList: any[]
    private ordersObservable;
    private selectableCategoriesObservable: Observable<any>;
    private selectedCategoryIdsObservable: Observable<any>;
    private anyOrder: boolean;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionOtp: Subscription
    private subscriptionSapIdList: Subscription



    ngOnInit(): void {
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectedCategoryIdsObservable = this.otpObservable.map(otp => otp.data.categoryIds);
        this.subscriptionOtp = this.otpObservable.subscribe(otp => {
            this.otp = otp;

            if (otp) {
                this.ordersObservable = this.orderService.getAnnotedOrdersByOtp(otp.data._id);
                this.orderService.hasOtpAnyOrder(otp.data._id).subscribe(anyOrder => this.anyOrder = anyOrder);

                this.subscriptionSapIdList= this.sapService.getSapItemsByOtpObservable(otp.data.name).subscribe(lst => {
                    this.sapIdList= lst
                })

                this.orderService.getAnnotatedOtpsForBudgetMap().first().subscribe(map => {
                    this.otpBudget= map.get(otp.data._id)
                    this.pieSpentChart = this.chartService.getSpentPieData(this.otpBudget.annotation.amountSpent / this.otpBudget.annotation.budget * 100);
                })
            }
        });
        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.equipeListObservable = this.orderService.getAnnotatedEquipes().map(equipes => equipes.map(eq => {
            return {
                id: eq.data._id,
                name: eq.data.name
            }
        }));

        this.annualForm = this.formBuilder.group({
            budgetAnnual: ['', Validators.required]
        });
    }

    save(formValue, isValid) {
        this.dataStore.addData('otps', {
            budgetAnnual: formValue.budgetAnnual,
            datStartAnnual: this.datStartAnnual || moment().format('DD/MM/YYYY HH:mm:ss'),
            datEndAnnual: this.datEndAnnual || moment().format('DD/MM/YYYY HH:mm:ss')
        }).first().subscribe(res => {
            var x = res;
            this.reset();
        });
    }

    reset() {
        this.annualForm.reset();
    }


    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionOtp.unsubscribe()
        this.subscriptionSapIdList.unsubscribe()
    }


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

    private childSapsStateChanged($event) {
        this.state.Saps = $event;
        this.stateChanged.next(this.state);
    }


    equipeChanged(newid) {
        if (!newid) return
        this.otp.data.equipeId = newid;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
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

    descriptionUpdated(description) {
        this.otp.data.description = description;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    budgetUpdated(budget) {
        if (! +budget) return
        this.otp.data.budget = budget;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    limitedToOwnerUpdated(flg) {
        this.otp.data.isLimitedToOwner = flg;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    blockedUpdated(block) {
        this.otp.data.isBlocked = block;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    deletedUpdated(flg) {
        this.otp.data.isDeleted = flg;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    closedUpdated(close) {
        this.otp.data.isClosed = close;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    priorityUpdated(priority) {
        this.otp.data.priority = priority;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    updatedDateStartAnnual(date) {
        this.datStartAnnual = date;
    }

    updatedDateEndAnnual(date) {
        this.datEndAnnual = date;
    }
private isAnnual: boolean = false;
    isAnnualChecked($event, otp, isAnnual: boolean) {
        this.otp.data.isAnnual = isAnnual;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

}