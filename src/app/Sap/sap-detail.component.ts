import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { SapService } from '../Shared/Services/sap.service'
import { Observable, BehaviorSubject, Subscription } from 'rxjs/Rx'
import { UserService } from './../Shared/Services/user.service'
import { EquipeService } from '../Shared/Services/equipe.service';
import { NgbTabChangeEvent, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import * as moment from "moment"


@Component(
    {
        selector: 'gg-sap-detail',
        templateUrl: './sap-detail.component.html'
    }
)
export class SapDetailComponent implements OnInit {
    constructor(private route: ActivatedRoute, private userService: UserService, private authService: AuthService, 
                private navigationService: NavigationService, private equipeService: EquipeService) {
    }

    @Input() sapObservable: Observable<any>;
    @Input() state;
    @Input() path: string
    @Input() isRoot: boolean = false

    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.selectedTabId) this.state.selectedTabId = '';
    }

    private authorizationStatusInfo: AuthenticationStatusInfo;
    private subscriptionAuthorization: Subscription
    private subscriptionSap: Subscription

    private sapObj;
    private sapItem;
    private sapEngage;
    private sapFacture;  

    private equipeListObservable: Observable<any>  
    private groupsForSelectionObservable: Observable<any>

    ngOnInit(): void {
        this.stateInit();

        this.subscriptionAuthorization = this.authService.getStatusObservable().subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.subscriptionSap = this.sapObservable.subscribe(res => {
            this.sapObj= res
            this.sapItem= res.mainData
            this.sapEngage= res.engaged
            this.sapFacture= res.factured
        })

        this.equipeListObservable = this.equipeService.getAnnotatedEquipes().map(equipes => equipes.map(eq => {
            return {
                id: eq.data._id,
                name: eq.data.name
            }
        }));

        this.groupsForSelectionObservable = this.equipeService.getAnnotatedEquipesGroups().map(groups => groups.map(group => {
            return {
                id: group.data._id,
                name: group.data.name
            }
        }))
        
    }

    ngOnDestroy(): void {
        this.subscriptionAuthorization.unsubscribe()
        this.subscriptionSap.unsubscribe()
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tabMax') {
            $event.preventDefault();
            this.navigationService.maximizeOrUnmaximize('/sap', this.sapItem.data.sapId, this.path, this.isRoot)
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

    navigateToOrder() {
        if (+this.sapItem.data.ourRef)
        {
            this.navigationService.maximizeOrUnmaximize('/order', this.sapItem.data.ourRef, this.path, false)
        }
        
    }

    equipeChanged(newid) {
        if (!newid) return
    }

    equipeGroupChanged(newid) {
        if (!newid) return
    }

}
