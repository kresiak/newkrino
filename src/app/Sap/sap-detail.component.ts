import { Component, Input, OnInit, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router'
import { SapService } from '../Shared/Services/sap.service'
import { Observable, BehaviorSubject } from 'rxjs/Rx'
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
    constructor(private sapService: SapService, private route: ActivatedRoute, private userService: UserService, private authService: AuthService, 
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

    private isPageRunning: boolean = true    

    private sapObj;
    private sapItem;
    private sapEngage;
    private sapFacture;  

    private equipeListObservable: Observable<any>  
    private groupsForSelectionObservable: Observable<any>
    private equipeId: string

    ngOnInit(): void {
        this.stateInit();

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        });

        this.sapObservable.takeWhile(() => this.isPageRunning).do(res => {
            this.sapObj= res
            this.sapItem= res.mainData
            this.sapEngage= res.engaged
            this.sapFacture= res.factured
        }).switchMap(res => {
            var sapId= res.mainData.data.sapId
            return this.sapService.getSapKrinoAnnotationMap().map(sapKrinoAnnotationMap => {
                if (!sapKrinoAnnotationMap || !sapKrinoAnnotationMap.has(sapId)) return undefined
                return sapKrinoAnnotationMap.get(sapId).equipeId
            }).takeWhile(() => this.isPageRunning)
        }).do(equipeId => {
            this.equipeId= equipeId
        })
        .subscribe()

        this.equipeListObservable = this.equipeService.getEquipesForAutocomplete()

        this.groupsForSelectionObservable = this.equipeService.getAnnotatedEquipesGroups().map(groups => groups.map(group => {
            return {
                id: group.data._id,
                name: group.data.name
            }
        }))
       
    }

    ngOnDestroy(): void {
        this.isPageRunning= false
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

    equipeChanged(equipeId) {
        this.sapService.updateSapEquipeAttribution(this.sapItem.data.sapId, equipeId)
    }

    equipeGroupChanged(newid) {
        if (!newid) return
    }

}
