import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx'
import { OrderService } from './../Shared/Services/order.service'
import { SapService } from './../Shared/Services/sap.service'
import { NavigationService } from '../Shared/Services/navigation.service'
import { AuthenticationStatusInfo, AuthService } from '../Shared/Services/auth.service'
import { EquipeService } from '../Shared/Services/equipe.service';

@Component(
    {
        templateUrl: './sap-list.routable.component.html'
    }
)
export class SapListComponentRoutable implements OnInit {
    sapPieceTypesInfo: any[];
    constructor(private navigationService: NavigationService, private authService: AuthService, private sapService: SapService, private equipeService: EquipeService) { }

    state: {}

    private sapItemsToAttribute: any[]
    private equipeListObservable: Observable<any>     

    private isPageRunning: boolean = true

    ngAfterViewInit() {
        this.navigationService.jumpToOpenRootAccordionElement()
    }

    ngOnInit(): void {
        this.navigationService.getStateObservable().takeWhile(() => this.isPageRunning).subscribe(state => {
            this.state = state
        })
        this.sapsObservable = this.sapService.getSapItemsObservable();

        this.authService.getStatusObservable().takeWhile(() => this.isPageRunning).subscribe(statusInfo => {
            this.authorizationStatusInfo = statusInfo
        })

        this.sapService.getSapPieceTypesInfoObservable().takeWhile(() => this.isPageRunning).subscribe(infos => {
            this.sapPieceTypesInfo = infos
        })

        this.sapService.getSapItemsToAttributeToEquipe().first().subscribe(items => {
            this.sapItemsToAttribute= items
        })

        this.equipeListObservable = this.equipeService.getEquipesForAutocomplete()
    }

    ngOnDestroy(): void {
        this.isPageRunning = false
    }

    getSapBytypeObservable(pieceType, idLength, idFirstChar) {
        return this.sapsObservable.map(items => items.filter(item => item.typesPiece===pieceType && +item.sapId.toString().length === +idLength && item.sapId.toString().startsWith(idFirstChar)))
    }

    private sapsObservable: Observable<any>;
    private authorizationStatusInfo: AuthenticationStatusInfo;

    equipeChanged(equipeId, sapItem) {
        sapItem.equipeId= equipeId
        this.sapService.updateSapEquipeAttribution(sapItem.sapId, equipeId)    
    }
    
    refreshAttributionList() {
        this.sapService.getSapItemsToAttributeToEquipe().first().subscribe(items => {
            this.sapItemsToAttribute= items
        })        
    }
}

