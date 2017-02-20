import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { DataStore } from '../Shared/Services/data.service'
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { NgbTabChangeEvent, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import * as moment from "moment"


@Component(
    {
        //moduleId: module.id,
        selector: 'gg-order-detail',
        templateUrl: './order-detail.component.html'
    }
)
export class OrderDetailComponent implements OnInit {
    constructor(private orderService: OrderService, private route: ActivatedRoute, private userService: UserService, private authService: AuthService,
        private dataStore: DataStore, private elementRef: ElementRef, private modalService: NgbModal, private router: Router, private navigationService: NavigationService) {

    }

    @Input() orderObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false

    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }


    private smallScreen: boolean;
    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionOrder: Subscription

    private otpListObservable: any
    private equipeListObservable



    ngOnInit(): void {
        this.stateInit();
        this.smallScreen = this.elementRef.nativeElement.querySelector('.orderDetailClass').offsetWidth < 600;

        this.otpListObservable = this.orderService.getAnnotatedOtps().map(otps => otps.map(otp => {
            return {
                id: otp.data._id,
                name: otp.data.name
            }
        }));

        this.equipeListObservable = this.orderService.getAnnotatedEquipes().map(equipes => equipes.map(eq => {
            return {
                id: eq.data._id,
                name: eq.data.name
            }
        }));

        this.subscriptionOrder = this.orderObservable.subscribe(order => {
            this.order = order
        });
        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionOrder.unsubscribe()
    }

    private saveDelivery(orderItem, formData) {
        var self = this
        let saveOrder = function (deliveryData, stockId: string = '') {
            if (stockId !== '') deliveryData['stockId'] = stockId;
            orderItem.data.deliveries.push(deliveryData);
            self.dataStore.updateData('orders', self.order.data._id, self.order.data);
        }

        if (+formData.qty < 1) return;
        if (!orderItem.data.deliveries) orderItem.data.deliveries = [];
        let deliveryData = {
            quantity: +formData.qty,
            date: moment().format('DD/MM/YYYY HH:mm:ss'),
            userId: this.authorizationStatusInfo.currentUserId
        };
        if (orderItem.annotation.needsLotNumber) {
            deliveryData['lotNb'] = formData.lot
        }
        if (orderItem.annotation.isStockProduct && formData.resell) {
            let qty = +formData.qty * +orderItem.annotation.stockDivisionFactor
            let prodData = {
                productId: orderItem.data.productId,
                quantity: qty,
                divisionFactor: orderItem.annotation.stockDivisionFactor,
                package: orderItem.annotation.stockPackaging,
                lotNumber: formData.lot,
                history: [{ userId: this.authorizationStatusInfo.currentUserId, date: moment().format('DD/MM/YYYY HH:mm:ss'), quantity: qty, orderId: this.order.data._id }]
            };
            this.dataStore.getDataObservable('products.stock').first().subscribe(stockItems => {
                let stockItem = stockItems.filter(si => si.productId === prodData.productId && si.divisionFactor === prodData.divisionFactor
                    && si.package === prodData.package && si.lotNumber === prodData.lotNumber)[0]
                if (stockItem) {
                    stockItem.quantity += prodData.quantity;
                    (stockItem.history = stockItem.history || []).push(prodData.history[0])
                    this.dataStore.updateData('products.stock', stockItem._id, stockItem)
                    saveOrder(deliveryData, stockItem._id)
                }
                else {
                    this.dataStore.addData('products.stock', prodData).first().subscribe(res => {
                        saveOrder(deliveryData, res._id)
                    });
                }
            })
        }
        else {
            saveOrder(deliveryData)
        }
        orderItem.annotation.nbDelivered += +formData.qty // for performance reason in responseness, even if observable will bring it back anyway
    }

    private selectedDeliveryItem;
    openModal(template, orderItem) {
        this.selectedDeliveryItem = orderItem;
        var ref = this.modalService.open(template, { keyboard: false, backdrop: "static", size: "lg" });
        var promise = ref.result;
        promise.then((data) => {
            this.saveDelivery(this.selectedDeliveryItem, data);
            this.selectedDeliveryItem = undefined;
        }, (res) => {
        });
        promise.catch((err) => {
        });
    }

    equipeChanged(newid) {
        if (!newid) return
        this.order.data.equipeId = newid;
        this.dataStore.updateData('orders', this.order.data._id, this.order.data);
    }


    private order;

    otpUpdated(orderItem, newOtpId): void {
        if (newOtpId && newOtpId.length > 0) {
            orderItem.data.otpId = newOtpId;
            this.orderService.updateOrder(this.order.data);
        }
    }

    updateTotalAmount(orderItem, newAmount): void {
        if (+newAmount) {
            orderItem.data.total = +newAmount;
            this.orderService.updateOrder(this.order.data);
        }
    }

    setDashlet() {
        this.userService.createOrderDashletForCurrentUser(this.order.data._id);
    }

    removeDashlet(dashletId) {
        if (dashletId)
            this.userService.removeDashletForCurrentUser(dashletId);
    }

    commentsUpdated(comments) {
        if (this.order && comments) {
            this.order.data.comments = comments;
            this.dataStore.updateData('orders', this.order.data._id, this.order.data);
        }

    }

    navigateToProduct(productId) {
        this.navigationService.maximizeOrUnmaximize('/product', productId, this.path, false)
    }

    deleteOrder() {
        if (!this.order.data.status) this.order.data.status = { history: [] }
        this.order.data.status.history.unshift({ date: moment().format('DD/MM/YYYY HH:mm:ss'), value: 'deleted' })
        this.order.data.status.value = 'deleted'
        this.dataStore.updateData('orders', this.order.data._id, this.order.data);
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/order', this.order.data._id, this.path, this.isRoot)
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

}
