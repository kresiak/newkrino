import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { Observable, Subscription } from 'rxjs/Rx'
import { DataStore } from './../Shared/Services/data.service'
import { ProductService } from './../Shared/Services/product.service';
import { OrderService } from './../Shared/Services/order.service';
import { EquipeService } from '../Shared/Services/equipe.service';
import { OtpService } from '../Shared/Services/otp.service'
import { UserService } from './../Shared/Services/user.service'
import { NavigationService } from './../Shared/Services/navigation.service'
import { SapService } from './../Shared/Services/sap.service'
import { ConfigService } from './../Shared/Services/config.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import * as moment from "moment"
import * as comparatorsUtils from './../Shared/Utils/comparators'
import * as dateUtils from './../Shared/Utils/dates'
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
        private formBuilder: FormBuilder, private otpService: OtpService, private equipeService: EquipeService, private configService: ConfigService) {
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
    private sapIdList: any[]
    private ordersObservable;
    private selectableCategoriesObservable: Observable<any>;
    private selectableClassificationsObservable: Observable<any>;

    private selectedCategoryIdsObservable: Observable<any>;
    private selectedClassificationIdsObservable: Observable<any>;
    private anyOrder: boolean;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionOtp: Subscription
    private subscriptionSapIdList: Subscription    

    ngOnInit(): void {        
        this.stateInit();
        this.selectableCategoriesObservable = this.productService.getSelectableCategories();
        this.selectableClassificationsObservable = this.otpService.getSelectableClassifications();


        this.selectedCategoryIdsObservable = this.otpObservable.map(otp => (otp && otp.data) ? otp.data.categoryIds : []);
        this.selectedClassificationIdsObservable = this.otpObservable.map(otp => (otp && otp.data) ? otp.data.classificationIds : []);

        this.subscriptionOtp = this.otpObservable.subscribe(otp => {
            if (!otp) return

            if (!comparatorsUtils.softCopy(this.otp, otp))
                this.otp = otp;

            if (otp) {
                this.ordersObservable = this.orderService.getAnnotedOrdersByOtp(otp.data._id);
                this.orderService.hasOtpAnyOrder(otp.data._id).subscribe(anyOrder => this.anyOrder = anyOrder);

                this.subscriptionSapIdList = this.sapService.getSapItemsByOtpObservable(otp.data.name).subscribe(lst => {
                    this.sapIdList = lst
                })

                this.pieSpentChart = this.chartService.getSpentPieData(this.otp.annotation.amountSpent / this.otp.annotation.budget * 100);
            }
        });
        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.equipeListObservable = this.equipeService.getEquipesForAutocomplete()       

        this.annualForm = this.formBuilder.group({
            budgetAnnual: ['', [Validators.required]]
        });

    }

    SaveNewBudget(formValue, isValid) {
        if (!isValid) return
        if (!this.otp.data.budgetPeriods) this.otp.data.budgetPeriods = []

        this.otp.data.budgetPeriods.push({
            budget: formValue.budgetAnnual,
            datStart: this.datStartAnnual || dateUtils.nowFormated(),
            datEnd: this.datEndAnnual || dateUtils.nowFormated()
        })
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data).first().subscribe(res => {
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

    classificationChanged(selectedIds) {
        this.otp.data.classificationIds = selectedIds;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    classificationHasBeenAdded(newCategory) {
        this.dataStore.addData('otp.product.classifications', { 'name': newCategory });
    }

    nameUpdated(name) {
        this.otp.data.name = name;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    descriptionUpdated(description) {
        this.otp.data.description = description;
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    noteUpdated(note) {
        this.otp.data.note = note;
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

    dateStartAnnualUpdated(date) {
        this.datStartAnnual = date;
    }

    dateEndAnnualUpdated(date) {
        this.datEndAnnual = date;
    }

    updatedIsAnnualChecked(isAnnual) {
        this.otp.data.isAnnual = isAnnual
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    excludeFixCostUpdated(excludeCost) {
        this.otp.data.excludeFixCost = excludeCost
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    warningNbMonthsToEndUpdated(monthsToEnd) {
        this.otp.data.warningNbMonthsToEnd = monthsToEnd
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    warningNbRepeatsUpdated(numberOfRepeats) {
        this.otp.data.warningNbRepeats = numberOfRepeats
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

    warningNbDaysBetweenRepeatsUpdated(numberOfDays) {
        this.otp.data.warningNbDaysBetweenRepeats = numberOfDays
        this.dataStore.updateData('otps', this.otp.data._id, this.otp.data);
    }

}