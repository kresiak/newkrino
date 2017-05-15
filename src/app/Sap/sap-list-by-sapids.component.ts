import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx'
import { SapService } from './../Shared/Services/sap.service'
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NavigationService } from './../Shared/Services/navigation.service'

@Component(
    {
        selector: 'gg-sap-by-sapids-list',
        templateUrl: './sap-list-by-sapids.component.html'
    }
)
export class SapListBySapIdsComponent implements OnInit {
    @Input() sapIdList: any[];
    @Input() otp: string
    @Input() state;
    @Input() path: string = 'saps'
    @Output() stateChanged = new EventEmitter();

    private stateInit() {
        if (!this.state) this.state = {};
        if (!this.state.openPanelId) this.state.openPanelId = '';
    }


    constructor(private sapService: SapService, private navigationService: NavigationService) {
    }

    private sapsObservable: Observable<any>
    private subscription: Subscription
    private totalEngaged: number=0

    private sapPostesEngOpenList: any[]

    ngOnInit(): void {
        this.stateInit();
        this.sapsObservable = this.sapService.getSapItemsObservableBySapIdList(this.sapIdList)
        this.subscription = this.sapsObservable.subscribe(sapList => {
            this.totalEngaged= this.sapService.getAmountEngagedByOtpInSapItems(this.otp, sapList)

            this.sapPostesEngOpenList= []
            var sum: number= 0
            sapList.sort((a, b) => a.mainData.data.sapId- b.mainData.data.sapId).forEach(sapObj => {
                sapObj.postList.filter(poste => poste.otp === this.otp && poste.amountResiduel > 0).forEach(sapPoste => {
                    sum+= sapPoste.amountResiduel
                    this.sapPostesEngOpenList.push({
                        sum: sum,
                        poste: sapPoste,
                        sapId: sapObj.mainData.data.sapId
                    })
                })
            })
        })
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe()
    }

    public beforeTabChange($event: NgbTabChangeEvent) {
        this.state.selectedTabId = $event.nextId;
        this.stateChanged.next(this.state);
    };

    private childAllStateChanged($event) {
        this.state.All = $event;
        this.stateChanged.next(this.state);
    }

    navigateToSap(sapId) {
        this.navigationService.maximizeOrUnmaximize('/sap', sapId, this.path+'|O:EngagementOpen', false)
    }


}