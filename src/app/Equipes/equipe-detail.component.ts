import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DataStore } from './../Shared/Services/data.service'
import { OrderService } from './../Shared/Services/order.service'
import { ProductService } from './../Shared/Services/product.service'
import { Observable, Subscription } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { ChartService } from './../Shared/Services/chart.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { SelectableData } from './../Shared/Classes/selectable-data'
import * as moment from "moment"

@Component(
    {
        //moduleId: module.id,
        selector: 'gg-equipe-detail',
        templateUrl: './equipe-detail.component.html'
    }
)
export class EquipeDetailComponent implements OnInit {
    private budgetForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private dataStore: DataStore, private orderService: OrderService, private userService: UserService, private chartService: ChartService,
        private productService: ProductService, private navigationService: NavigationService, private authService: AuthService) {
    }
    private pieSpentChart;

    @Input() equipeObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false

    @Input() initialTab: string = '';
    @Output() stateChanged = new EventEmitter();

    private otpListObservable: any

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = this.initialTab;
    }



    ngOnInit(): void {
        this.stateInit();
        this.selectableManagers = this.authService.getSelectableUsers(true);
        this.selectableUsers = this.authService.getSelectableUsers(true);
        this.subscriptionEquipe = this.equipeObservable.subscribe(eq => {
            this.equipe = eq;
            if (eq) {
                this.pieSpentChart = this.chartService.getSpentPieData(this.equipe.annotation.amountSpent / this.equipe.annotation.budget * 100);
                this.usersObservable = this.authService.getAnnotatedUsersByEquipeId(this.equipe.data._id)
                this.otpsObservable = this.orderService.getAnnotatedOtpsByEquipe(this.equipe.data._id);
                this.ordersObservable = this.orderService.getAnnotedOrdersByEquipe(eq.data._id);
                this.orderService.hasEquipeAnyOrder(eq.data._id).first().subscribe(anyOrder => this.anyOrder = anyOrder);

                this.selectedManagerIdsObservable = Observable.from([this.equipe.data.managerIds]);
                this.selectedUserIdsObservable = Observable.from([this.equipe.data.userIds]);

                this.stockOrdersObservable = this.productService.getAnnotatedStockOrdersByEquipe(eq.data._id)

                this.fridgeOrdersObservable = this.orderService.getAnnotatedFridgeOrdersByEquipe(eq.data._id)
                this.webVouchersObservable = this.productService.getAnnotatedUsedVouchersOfEquipeByDate(eq.data._id)

                this.bilanObservable = this.orderService.getBilanForEquipe(eq.data._id)
            }
        });
        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.otpListObservable = this.orderService.getAnnotatedOtps().map(otps => otps.map(otp => {
            return {
                id: otp.data._id,
                name: otp.data.name
            }
        }));

        const montantRegEx = `^\\d+(.\\d*)?$`;
        this.budgetForm = this.formBuilder.group({
            montant: ['', [Validators.required, Validators.pattern(montantRegEx)]],
            comment: ['', [Validators.required]]
        });
    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionEquipe.unsubscribe()
    }

    resetNewBudget() {
        this.budgetForm.reset();
    }

    saveNewBudget(formValue, isValid) {
        if (!isValid) return
        if (!+formValue.montant) return

        if (!this.equipe.data.budgets) this.equipe.data.budgets= []
        let now = moment().format('DD/MM/YYYY HH:mm:ss')

        this.equipe.data.budgets.push({
            comment: formValue.comment,
            amount: +formValue.montant,
            otpId: this.selectedOtpIdForNewBudget,
            date: now
        })
            
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }



    /*    @Input() selectedTabId;
        @Output() tabChanged = new EventEmitter();
    */
    private selectableManagers: Observable<SelectableData[]>;
    private selectedManagerIdsObservable: Observable<any>;
    private selectableUsers: Observable<SelectableData[]>;
    private selectedUserIdsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionEquipe: Subscription

    private usersObservable: Observable<any>;
    private otpsObservable: Observable<any>;
    private ordersObservable: Observable<any>;
    private fridgeOrdersObservable: Observable<any>;
    private stockOrdersObservable: Observable<any>;
    private webVouchersObservable: Observable<any>
    private bilanObservable: Observable<any>

    private equipe: any;
    private anyOrder: boolean;
    
    setDashlet() {
        this.userService.createEquipeDashletForCurrentUser(this.equipe.data._id);
    }

    removeDashlet(dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    }

    commentsUpdated(comments) {
        if (this.equipe && comments) {
            this.equipe.data.comments = comments;
            this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
        }
    }

    userSelectionChanged(selectedIds: string[]) {
        this.equipe.data.userIds = selectedIds;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    managerSelectionChanged(selectedIds: string[]) {
        this.equipe.data.managerIds = selectedIds;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/equipe', this.equipe.data._id, this.path, this.isRoot)
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

    private childOtpsStateChanged($event) {
        this.state.Otps = $event;
        this.stateChanged.next(this.state);
    }

    private childUsersStateChanged($event) {
        this.state.Users = $event;
        this.stateChanged.next(this.state);
    }



    nameUpdated(name) {
        this.equipe.data.name = name;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    descriptionUpdated(name) {
        this.equipe.data.description = name;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    nbOfMonthAheadAllowedUpdated(nbOfMonths) {
        this.equipe.data.nbOfMonthAheadAllowed = nbOfMonths;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    blockedUpdated(isBlock) {
        this.equipe.data.isBlocked = isBlock;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    }

    private selectedOtpIdForNewBudget: string = ''

    otpForNewBudgetChanged(otpId) {
        this.selectedOtpIdForNewBudget = otpId
    }

    budgetAmountUpdated(budgetObject, amount: number) {
        if (!+amount) return
        budgetObject.amount = +amount;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };

    budgetCommentUpdated(budgetObject, comment) {
        if (!comment) return
        budgetObject.comment = comment;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };

    budgetOtpUpdated(budgetObject, otpId) {
        if (!otpId) return
        budgetObject.otpId = otpId;
        this.dataStore.updateData('equipes', this.equipe.data._id, this.equipe.data);
    };
}