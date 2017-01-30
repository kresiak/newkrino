import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { OrderService } from '../Shared/Services/order.service'
import { DataStore } from '../Shared/Services/data.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { NgbTabChangeEvent, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'



@Component(
    {
        moduleId: module.id,
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
    @Input() isRoot: boolean=false
    
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }


    private smallScreen: boolean;
    private authorizationStatusInfo: AuthenticationStatusInfo;

    ngOnInit(): void {
        this.stateInit();
        this.smallScreen = this.elementRef.nativeElement.querySelector('.orderDetailClass').offsetWidth < 600;

        this.orderObservable.subscribe(order => {
            this.order = order
            this.selectableOtpsObservable = this.orderService.getSelectableOtps();
            if (this.order && this.order.annotation)
                this.order.annotation.items.forEach(item => {
                    item.annotation.idObservable = new BehaviorSubject<any[]>([item.data.otpId]);
                });
        });
        this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo= statusInfo
        });
    }

    ngAfterViewInit() {

    }

    private saveDelivery(orderItem, formData) {
        if (+formData.qty < 1) return;
        if (!orderItem.data.deliveries) orderItem.data.deliveries = [];
        let deliveryData = {
            quantity: +formData.qty,
            lotNb: formData.lot
        };
        if (formData.resell) {
            let prodData = {
                productId: orderItem.data.productId,
                orderId: this.order.data._id,
                quantity: formData.qty,
                factor: formData.factor
            };
            this.dataStore.addData('products.stock', prodData).first().subscribe(res => {
                deliveryData['stockId'] = res._id;
                orderItem.data.deliveries.push(deliveryData);
                this.dataStore.updateData('orders', this.order.data._id, this.order.data);
            });
        }
        else {
            orderItem.data.deliveries.push(deliveryData);
            this.dataStore.updateData('orders', this.order.data._id, this.order.data);
        }
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



    private order;
    private selectableOtpsObservable: Observable<any>;

    otpUpdated(orderItem, newOtpIds): void {
        if (newOtpIds && newOtpIds.length > 0) {
            orderItem.data.otpId = newOtpIds[0];
            orderItem.annotation.idObservable.next([orderItem.data.otpId]);
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
